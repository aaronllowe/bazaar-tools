const axios = require("axios");

async function main() {
  const formatter = Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
  const costs = [];
  const res = await axios.get("https://api.hypixel.net/skyblock/bazaar").then((res) => res.data);
  for (const product in res.products) {
    const p = res.products[product].quick_status.productId;
    let data = { id: p, cost: 0, supply: 0 };
    if (res.products[product].quick_status.buyOrders < 200) {
      res.products[product].buy_summary.forEach((order) => {
        data.cost += order.amount * order.pricePerUnit;
        data.supply += order.amount;
      });
      data.cost = Math.round(data.cost);
      if (data.cost + data.supply != 0) costs.push(data);
    }
  }

  costs.sort((a, b) => b.cost - a.cost);

  costs.forEach(item => item.cost = formatter.format(item.cost))

  console.table(costs);
}

main();
