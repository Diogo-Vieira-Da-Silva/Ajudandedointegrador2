  const express = require("express"); // Framework para criar servidor e rotas
const path = require("path"); // Módulo nativo do Node para lidar com caminhos
const session = require("express-session"); // Para gerenciar sessões

const app = express(); // Cria a aplicação Express

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Middleware de sessão
app.use(session({
  secret: 'sensecare_secret', // Chave secreta para assinar a sessão
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Para desenvolvimento, false; em produção, true com HTTPS
}));

// Middleware para servir arquivos estáticos (HTML, CSS, JS da pasta atual/)
app.use(express.static(__dirname));

// Rota para servir index.html na raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Arrays para armazenar dados em memória
let enfermeiros = [
  {
    id: 1,
    nome: 'Lucas',
    sobrenome: 'Ferreira Mendes',
    cpf_email: 'lucas.mendes@sensecare.com',
    telefone: '(11) 99123-7788',
    senha: 'senha123',
    sexo: 'masculino',
    data_contratacao: '2024-04-20',
    data_nascimento: '1992-10-05',
    diploma: 'Enfermagem - USP',
    cargo: 'Enfermeiro Chefe',
    complementos: 'Responsável por triagem e supervisão.'
  }
];

let pacientes = [];

// Rotas para Enfermeiro
app.get("/Enfermeiro", (req, res) => {
  if (!req.session.Enfermeiro) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  res.json(enfermeiros);
});

app.post("/Enfermeiro", (req, res) => {
  const { nome, sobrenome, cpf_email, telefone, senha, sexo, data_contratacao, data_nascimento, diploma, cargo, complementos } = req.body;
  const id = enfermeiros.length + 1;
  const novoEnfermeiro = { id, nome, sobrenome, cpf_email, telefone, senha, sexo, data_contratacao, data_nascimento, diploma, cargo, complementos };
  enfermeiros.push(novoEnfermeiro);
  res.json({ message: "Enfermeiro adicionado com sucesso!" });
});

// Login para Enfermeiro
app.post("/login", (req, res) => {
  const { cpfEmail, senha } = req.body;
  const enfermeiro = enfermeiros.find(e => e.cpf_email === cpfEmail && e.senha === senha);
  if (enfermeiro) {
    req.session.Enfermeiro = enfermeiro;
    res.json({ message: "Login bem-sucedido", Enfermeiro: enfermeiro });
  } else {
    res.status(401).json({ message: "Credenciais inválidas" });
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logout bem-sucedido" });
});

// Get current Enfermeiro
app.get("/session", (req, res) => {
  if (req.session.Enfermeiro) {
    res.json({ Enfermeiro: req.session.Enfermeiro });
  } else {
    res.status(401).json({ message: "Não logado" });
  }
});

// Middleware para verificar sessão
function requireAuth(req, res, next) {
  if (req.session.Enfermeiro) {
    next();
  } else {
    res.status(401).json({ message: "Sessão expirada" });
  }
}


app.listen(3000, () =>
  console.log("Servidor rodando em http://localhost:3000")
);

// Rotas para Paciente
app.get("/Paciente", requireAuth, (req, res) => {
  res.json(pacientes);
});

app.get("/Paciente/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const paciente = pacientes.find(p => p.id == id);
  res.json(paciente || {});
});

app.post("/Paciente", requireAuth, (req, res) => {
  const {
    primeiro_nome,
    sobrenome,
    data_nascimento,
    cpf,
    endereco,
    telefone,
    nome_responsavel,
    telefone_responsavel,
    procedimento,
    historico_doencas,
    medicacoes,
    sexo,
    prioridade,
    risco,
    alergias,
    especificacoes
  } = req.body;
  const id = pacientes.length + 1;
  const novoPaciente = { id, primeiro_nome, sobrenome, data_nascimento, cpf, endereco, telefone, nome_responsavel, telefone_responsavel, procedimento, historico_doencas, medicacoes, sexo, prioridade, risco, alergias, especificacoes };
  pacientes.push(novoPaciente);
  res.json({ message: "Paciente adicionado com sucesso!" });
});

app.delete("/Paciente/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const index = pacientes.findIndex(p => p.id == id);
  if (index !== -1) {
    pacientes.splice(index, 1);
    res.json({ message: "Paciente deletado com sucesso!" });
  } else {
    res.status(404).json({ message: "Paciente não encontrado" });
  }
});


