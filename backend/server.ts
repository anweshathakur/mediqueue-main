import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`MediQueue backend running on port ${PORT}`);
});