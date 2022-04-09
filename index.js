const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51KmYnpSGNHOuvtTi37YqIAffwixhcY41XDWGJqGrIvE5kvsYJR4FEjYf1nkuULleZqGorLsIKbq2fvaODlPEkjg800EBGsivpz"
);
const uuid = require("uuid");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Stripe integration");
});

app.get("/payment", (req, res) => {
  const { product, token } = req.body;
  console.log("Product ", product);
  console.log("Price ", product.price);
  const idempotencyKey = uuid();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `purchase of ${product.name}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(5000, () => {
  console.log("server running on http://localhost:5000");
});
