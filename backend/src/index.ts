import Express from "express";


let app = Express();
app.set('view engine', 'ejs');
app.use(Express.static('static'));
app.get('/', (req, res) => {
    res.render('index', { name: req.query.name });
})
app.listen(80, () => {
    console.log(`Server is running on port 80`);
});