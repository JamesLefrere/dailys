const fs = require('fs')
const path = require('path')
const { format } = require('date-fns');

const getStandupMd = (formattedDate: string, previousItems: string[]) => `__${formattedDate}__

---

### Standup

**Previous**

${previousItems.join('\n')}

**Today**

- [ ]

**Impediments**

* None

---

### Notes


`

const main = async () => {
    const standupsPath = path.join(__dirname, 'standups');
    const fileNames = await fs.promises.readdir(standupsPath)
    const previousFileName = fileNames[fileNames.length - 1]

    const formattedDate: string = format(new Date(), 'yyyy-MM-dd')
    const standupFileName = `${formattedDate}.md`;
    const standupPath = path.join(standupsPath, standupFileName)

    try {
        const { isFile } = await fs.promises.stat(standupPath)
        if (isFile) {
            return standupPath
        }
    } catch {
        // Ignore
    }

    let previousItems: string[] = [];
    if (previousFileName) {
        const previousFile = await fs.promises.readFile(path.join(standupsPath, previousFileName))
        const lines: string[] = previousFile
            .toString()
            .split('\n')
            .filter(l => l.length > 0)

        const todayIdx = lines.findIndex(l => l === '**Today**')
        const impedimentsIdx = lines.findIndex(l => l === '**Impediments**')

        previousItems = lines.slice(todayIdx + 1, impedimentsIdx)
    }

    const standupMd = getStandupMd(formattedDate, previousItems)

    await fs.promises.writeFile(standupPath, standupMd)
    return standupPath
}

main()
    .then((result) => {
        process.stdout.write(result)
        process.exit(0)
    })
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
