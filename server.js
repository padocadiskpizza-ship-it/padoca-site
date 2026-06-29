const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// Estado do site e banco de dados temporário em memória
let siteOnline = true;
let listaPedidos = [];
let proximoIdPedido = 1;

// Sistema de Promoção gerenciada pelo Painel
let promocaoAtual = "Ganhe uma bebida na compra de duas pizzas inteiras!";

// Função para remover emojis de qualquer string antes de salvar/processar no backend
function removerEmojis(texto) {
    if (typeof texto !== 'string') return texto;
    return texto.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F300}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{00A0}-\u{00FF}]/gu, '');
}

// Middleware de segurança: Limpa emojis de todos os dados recebidos na requisição
app.use((req, res, next) => {
    if (req.body) {
        for (let chave in req.body) {
            if (typeof req.body[chave] === 'string') {
                req.body[chave] = removerEmojis(req.body[chave]);
            }
        }
    }
    next();
});

// Lista exata das suas 28 pizzas com a ordem, preços informados e fotos de 1 a 28
const cardapio = [
    { id: 1, nome: "Mussarela", preco: 55.00, ingredientes: "Molho, mussarela, tomate e orégano." },
    { id: 2, nome: "Marguerita", preco: 55.00, ingredientes: "Molho, mussarela, manjericão fresco e rodelas de tomate." },
    { id: 3, nome: "Calabreza", preco: 55.00, ingredientes: "Molho, mussarela, calabresa fatiada e cebola." },
    { id: 4, nome: "Presunto", preco: 55.00, ingredientes: "Molho, mussarela e presunto cozido fatiado." },
    { id: 5, nome: "Frango Bacon", preco: 64.00, ingredientes: "Molho, mussarela, frango desfiado e bacon crocante." },
    { id: 6, nome: "Frango com Catupiry", preco: 60.00, ingredientes: "Molho, mussarela, frango desfiado e catupiry original." },
    { id: 7, nome: "Frango com Cheddar", preco: 60.00, ingredientes: "Molho, mussarela, frango desfiado e cheddar cremoso." },
    { id: 8, nome: "Provolombo", preco: 60.00, ingredientes: "Molho, mussarela, lombo defumado e queijo provolone." },
    { id: 9, nome: "Portuguesa", preco: 60.00, ingredientes: "Molho, mussarela, presunto, ovos, cebola e ervilha." },
    { id: 10, nome: "Palmito", preco: 60.00, ingredientes: "Molho, mussarela e palmito picado selecionado." },
    { id: 11, nome: "Tropical", preco: 60.00, ingredientes: "Molho, mussarela, palmito e milho verde." },
    { id: 12, nome: "Canadense", preco: 60.00, ingredientes: "Molho, lombo canadense fatiado, cebola e catupiry." },
    { id: 13, nome: "Atum", preco: 60.00, ingredientes: "Molho, atum sólido de qualidade e cebola fatiada." },
    { id: 14, nome: "Calapiry", preco: 60.00, ingredientes: "Molho, mussarela, calabresa moída ou fatiada e catupiry." },
    { id: 15, nome: "Bacon", preco: 60.00, ingredientes: "Molho, mussarela e tiras generosas de bacon." },
    { id: 16, nome: "Mineira", preco: 60.00, ingredientes: "Molho, mussarela, catupiry, milho e bacon." },
    { id: 17, nome: "Romana", preco: 60.00, ingredientes: "Molho, mussarela, filés de aliche e parmesão." },
    { id: 18, nome: "Pepperoni", preco: 60.00, ingredientes: "Molho, mussarela e rodelas de pepperoni premium." },
    { id: 19, nome: "Champignom", preco: 60.00, ingredientes: "Molho, mussarela e cogumelos champignon fatiados." },
    { id: 20, nome: "Baiana", preco: 60.00, ingredientes: "Molho, calabresa moída, pimenta calabresa, ovos e cebola." },
    { id: 21, nome: "Dois Queijos", preco: 55.00, ingredientes: "Molho, mussarela e cobertura cremosa de catupiry." },
    { id: 22, nome: "Tres Queijos", preco: 60.00, ingredientes: "Molho, mussarela, catupiry e queijo provolone." },
    { id: 23, nome: "Quatro Queijos", preco: 65.00, ingredientes: "Mussarela, provolone, parmesão e gorgonzola." },
    { id: 24, nome: "Brocolis", preco: 60.00, ingredientes: "Molho, mussarela, brócolis temperado e alho frito." },
    { id: 25, nome: "Carne Seca", preco: 64.00, ingredientes: "Molho, mussarela, carne seca desfiada e cebola roxa." },
    { id: 26, nome: "Pepperoni Especial", preco: 65.00, ingredientes: "Molho, mussarela, dobro de pepperoni selecionado e queijo parmesão." },
    { id: 27, nome: "Americana", preco: 60.00, ingredientes: "Molho, mussarela, presunto, ovos, bacon e milho." },
    { id: 28, nome: "Escarola", preco: 60.00, ingredientes: "Molho, escarola refogada alho e óleo, mussarela e bacon." }
];

// CORREÇÃO: Força o Node.js a liberar a leitura de arquivos e pastas internas de forma pública
app.use(express.static(__dirname));
app.use('/imgs', express.static(path.join(__dirname, 'imgs')));

// Inteligência Artificial de Segurança
function analisarSegurancaPedido(pedido) {
    const nomeBaixo = pedido.nome.toLowerCase();
    const telLimpo = pedido.telefone.replace(/\D/g, '');
    if (nomeBaixo.includes('teste') || telLimpo.startsWith('0000') || telLimpo.length < 10) return 'Baixa (Suspeito)';
    if (pedido.tipoCadastro === 'simples') return 'Média (Cadastro Rápido)';
    return 'Alta (Cliente Verificado)';
}

// Rotas para as Páginas HTML Principais
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'clientes.html')));
app.get('/painel', (req, res) => res.sendFile(path.join(__dirname, 'painel.html')));

// APIs do Sistema
app.get('/api/cardapio', (req, res) => res.json(cardapio));
app.get('/api/status', (req, res) => res.json({ online: siteOnline }));
app.post('/api/status', (req, res) => { siteOnline = req.body.online; res.json({ success: true, online: siteOnline }); });
app.get('/api/promocao', (req, res) => res.json({ texto: promocaoAtual }));
app.post('/api/promocao', (req, res) => { promocaoAtual = req.body.texto; res.json({ success: true }); });
app.get('/api/pedidos', (req, res) => res.json(listaPedidos));

app.post('/api/pedidos/novo', (req, res) => {
    if (!siteOnline) return res.status(403).json({ error: "A pizzaria está fechada." });
    const novoPedido = {
        id: proximoIdPedido++,
        ...req.body,
        status: 'pendente',
        motivoRecusa: '',
        seguranca: analisarSegurancaPedido(req.body),
        dataHora: new Date().toLocaleTimeString('pt-BR')
    };
    listaPedidos.push(novoPedido);
    res.json({ success: true, pedidoId: novoPedido.id });
});

app.post('/api/pedidos/status', (req, res) => {
    const { id, status, motivoRecusa } = req.body;
    const pedido = listaPedidos.find(p => p.id === id);
    if (pedido) {
        pedido.status = status;
        if (motivoRecusa) pedido.motivoRecusa = motivoRecusa;
        return res.json({ success: true });
    }
    res.status(404).json({ error: "Pedido não encontrado." });
});

app.get('/api/pedidos/status/:id', (req, res) => {
    const pedido = listaPedidos.find(p => p.id === parseInt(req.params.id));
    if (pedido) return res.json({ status: pedido.status, motivoRecusa: pedido.motivoRecusa });
    res.json({ status: 'concluido' });
});

app.post('/api/pedidos/concluir', (req, res) => {
    listaPedidos = listaPedidos.filter(p => p.id !== req.body.id);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
