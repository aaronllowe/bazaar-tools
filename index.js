const axios = require("axios");
const formatter = Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

let lastUpdate;

async function main() {
  try {
    let res = await axios.get("https://api.hypixel.net/skyblock/bazaar");
    lastUpdate = res.headers["last-modified"];
    res = res.data;
    let costs = [];

    for (const product in res.products) {
      const p = res.products[product].quick_status.productId;
      let data = { id: p, cost: 0, supply: 0 };
      if (res.products[product].quick_status.buyOrders <= 30) {
        res.products[product].buy_summary.forEach((order) => {
          data.cost += order.amount * order.pricePerUnit;
          data.supply += order.amount;
        });
        data.cost = Math.round(data.cost);
        if (data.cost + data.supply != 0) costs.push(data);
      }
    }

    costs.sort((a, b) => b.cost - a.cost);
    costs = costs.filter((item) => item.supply < 1000 && item.cost < 10_000_000);
    costs.forEach((item) => (item.cost = formatter.format(item.cost)));

    console.clear();
    console.table(costs);
    console.log("Current Time:             " + new Date(Date.now()).toLocaleTimeString("en-US"));
    console.log("Last update from API:     " + new Date(lastUpdate).toLocaleTimeString("en-US"));
    console.log("Delta:                    " + (Date.now() - new Date(lastUpdate)) / 1000 + " seconds");
  } catch (error) {
    console.log("Unable to fetch data from API");
  }
}

main();
setInterval(async () => {
  const t = await axios.head("https://api.hypixel.net/skyblock/bazaar").then((res) => res.headers["last-modified"]);
  if (t > lastUpdate) main();
}, 1000);
