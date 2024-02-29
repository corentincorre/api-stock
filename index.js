// Add Express
const express = require("express");
let stocks = [];

// Initialize Express
const app = express();
app.use(express.json())

// Create GET request
app.get("/api/ping", (req, res) => {
    res.send("PONG");
});

app.get("/api/stock", (req, res) => {
    res.status(200).send(JSON.stringify(stocks));
});

app.post("/api/stock/:productId/movement", async (req, res) => {

    console.log(req.body)
    const productInStock = stocks.findIndex(x => x.productId === req.params.productId);
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


});

// Initialize server
app.listen(5000, () => {
    console.log("Running on port 5000.");
});

module.exports = app;