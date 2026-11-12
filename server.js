import express from 'express'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/', async (req, res) => {
    res.status(200).json({
        mensagem: 'API da Empresa Primora funcionando!'
    })
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})