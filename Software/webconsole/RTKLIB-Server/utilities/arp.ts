import arp = require("node-arp");

export async function getARPTable(ipaddress?: string): Promise<arp.IARPRecord[]> {
	return new Promise<arp.IARPRecord[]>((resolve, reject) => {
		arp.getARPTable(ipaddress, (err, result) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(result);
		});
	});
}
