// Add Express
const express = require("express");
const https = require("https");
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
    if (!req.body || (req.params.productId !== req.body.productId) || req.body.quantity < 0) {
        res.status(400).send()
    }
    const productInStock = stocks.findIndex(x => x.productId === req.params.productId);

    switch (req.body.status) {
        case "Supply":
            if (productInStock !== -1) {
                stocks[productInStock].quantity += req.body.quantity;
                res.status(204);
                break;
            }
            const respProductInCatalog = await fetch("http://microservices.tp.rjqu8633.odns.fr/api/products/" + req.params.productId);
            const productInCatalog = await respProductInCatalog.json();
            if (productInCatalog && !(productInCatalog.statusCode === 500)) {
                stocks.push({
                    productId: req.params.productId,
                    quantity: req.body.quantity
                });
                res.status(204);
                break;
            }
            res.status(401);
            break;
        case "Reserve":
            if (productInStock !== -1 && (stocks[productInStock].quantity >= req.body.quantity)) {
                stocks[productInStock].quantity -= req.body.quantity;
                if (stocks[productInStock].quantity === 0) notifyStock(req.params.productId);
                const productInReservedStock = reservedStocks.findIndex(x => x.productId === req.params.productId);
                if (productInReservedStock !== -1) {
                    reservedStocks[productInReservedStock].quantity += req.body.quantity;
                } else {
                    reservedStocks.push({
                        productId: req.params.productId,
                        quantity: req.body.quantity
                    });
                }
                res.status(204);
                break;
            }
            res.status(400);
            break;
        case "Removal":
            const productInReservedStock = reservedStocks.findIndex(x => x.productId === req.params.productId);
            if (productInReservedStock !== -1 && (reservedStocks[productInReservedStock].quantity >= req.body.quantity)) {
                reservedStocks[productInReservedStock] -= req.body.quantity;
                res.status(204);
                break;
            }
            res.status(400);
            break;
        default:
            res.status(400);
            break;
    }
    res.send()
});
function notifyStock(productId) {
    const options = {
        hostname: 'https://micro2-tau.vercel.app',
        path: '/api/supply-needed',
        method: 'POST',
        body: { productId: productId }
    };

    const req = https.request(options)
    req.on('error', (e) => {
        console.error(e);
        setTimeout(() => notifyStock(productId), 5000)
    });
}

// Initialize server
app.listen(5000, () => {
    console.log("Running on port 5000.");
});

module.exports = app;