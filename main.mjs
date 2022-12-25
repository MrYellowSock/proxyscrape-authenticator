import { updater } from "./common.mjs"

const API_KEY = process.argv[2]
const SLOT = Number(process.argv[3])

if (!API_KEY || Number.isNaN(SLOT)) {
	console.error("missing arg(s)")
	process.exit(1)
}

const update = updater(API_KEY, SLOT)
update().then(() => {
	setInterval(update, 60e3)
})
