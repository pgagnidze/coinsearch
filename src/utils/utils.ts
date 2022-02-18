// deno-lint-ignore-file no-explicit-any
const glueSlugs = (coins: { id: string; slug: string }) => {
    let slugParams = ''
    for (const slug of Object.values(coins)) {
        slugParams += `${slug},`
    }
    slugParams = slugParams.slice(0, -1)
    return slugParams
}

const chunk = (input: any[], size: number) => {
    return input.reduce((arr, item, idx: number) => {
        return idx % size === 0
            ? [...arr, [item]]
            : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]]
    }, [])
}

const capitalize = (str: string) => {
    return str.trim().replace(/^\w/, (c) => c.toUpperCase())
}

const orderedDiff = (lhs: any, rhs: any) => {
    const diff = {}
    for (const [key, value] of Object.entries(rhs)) {
        if (JSON.stringify(value) !== JSON.stringify(lhs[key])) diff[key] = value
    }
    return diff
}

export { glueSlugs, chunk, capitalize, orderedDiff }
