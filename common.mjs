import fetch from "node-fetch";
function fetchJson(url) {
	return fetch(url).then(res => res.json()).catch(err => ({ status: "fetch_error", message: err }))
}
function fetchWithKey(apiKey) {
	return (url) => fetchJson(url + `&auth=${apiKey}`)
}
function resgisterIP(mfetch, targetSlot, yourIp, whitelistedIps) {
	const occupied = whitelistedIps[targetSlot]
	if (whitelistedIps.includes(yourIp)) {
		console.log("Ip already exists OK.")
		return Promise.resolve({ status: "ok", message: "already exists" })
	}
	else if (!occupied) {
		console.log("no item in slot, adding one")
		return mfetch("https://api.proxyscrape.com/v2/account/datacenter_shared/whitelist?type=add&ip[]=" + yourIp)
	}
	else {
		console.log('replacing', occupied, 'with', yourIp)
		return mfetch(`https://api.proxyscrape.com/v2/account/datacenter_shared/whitelist?type=set&ip[]=${occupied}&ip[]=${yourIp}`)
	}
}
export function updater(API_KEY, SLOT) {
	let lastRegisteredIp = ""
	const mfetch = fetchWithKey(API_KEY)
	return async () => {
		const ipInfo = await fetchJson('https://ifconfig.me/all.json')
		if (!ipInfo.ip_addr) {
			console.log('bad ip', ipInfo)
			return
		}
		if (ipInfo.ip_addr == lastRegisteredIp) {
			return;
		}
		const whitelist = await mfetch('https://api.proxyscrape.com/v2/account/datacenter_shared/whitelist?type=get')
		if (whitelist.status != "ok") {
			console.log('fetching whitelist failed', whitelist)
			return
		}
		if (SLOT >= whitelist.maxips) {
			console.error("slot out of range")
			process.exit(1)
		}

		let regisres = await resgisterIP(mfetch, SLOT, ipInfo.ip_addr, whitelist.whitelisted)
		console.log("Registration=>", regisres)
		if (regisres.status == 'ok') {
			lastRegisteredIp = ipInfo.ip_addr
		}
	}
}
