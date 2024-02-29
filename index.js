// Add Express
const express = require("express");
let stocks = [];
let reservedStocks = [];

// Initialize Express
const app = express();
app.use(express.json())

// Create GET request
app.get("/api/ping", (req, res) => {
    res.send("PONG");
});

app.get("/api/stock", (req, res) => {
    res.status(200).json(stocks);
});

app.post("/api/stock/:productId/movement", async (req, res) => {
    const productInStock = stocks.findIndex(x => x.productId === req.params.productId);

    switch (req.body.status) {
        case "Supply":
            if (productInStock !== -1) {
                stocks[productInStock].quantity += req.body.quantity;
                return res.status(204);
            }
            const respProductInCatalog = await fetch("http://microservices.tp.rjqu8633.odns.fr/api/products/" + req.params.productId);
            const productInCatalog = await respProductInCatalog.json();
            if (productInCatalog) {
                stocks.push({
                    productId: req.params.productId,
                    quantity: req.body.quantity
                });
                return res.status(204);
            }
            return res.status(401);
        case "Reserve":
            if (productInStock !== -1 && stocks[productInStock].quantity <= req.body.quantity) {
                stocks[productInStock].quantity -= req.body.quantity;
                reservedStocks.push({
                    productId: req.params.productId,
                    quantity: req.body.quantity
                });
                return res.status(204);
            }
            return res.status(400);
        case "Removal":
            break;
        default:
            return res.status(400);
    }



});

// Initialize server
app.listen(5000, () => {
    console.log("Running on port 5000.");
});

module.exports = app;