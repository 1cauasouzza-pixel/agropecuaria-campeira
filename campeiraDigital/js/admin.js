// ========================================
// DADOS INICIAIS
// ========================================

function carregarLista(chave) {
    try {
        const dadosSalvos = localStorage.getItem(chave);
        const dados = dadosSalvos === null ? [] : JSON.parse(dadosSalvos);

        if (!Array.isArray(dados)) {
            throw new Error("Os dados salvos possuem formato inválido.");
        }

        return {
            dados: dados,
            valida: true,
            ausente: dadosSalvos === null
        };
    } catch (erro) {
        console.error("Erro ao carregar " + chave + ":", erro);

        return {
            dados: [],
            valida: false,
            ausente: false
        };
    }
}

const resultadoProdutos = carregarLista("produtos");

const produtosValidos = resultadoProdutos.valida &&
    resultadoProdutos.dados.every(function (produto) {
        return produto !== null &&
            typeof produto === "object" &&
            !Array.isArray(produto);
    });

let produtos = produtosValidos ? resultadoProdutos.dados : [];

const categoriasPadrao = [
    "Rações",
    "Acessórios",
    "Medicamentos",
    "Higiene e cuidados",
    "Jardinagem"
];

const resultadoCategorias = carregarLista("categorias");

const categoriasValidas = resultadoCategorias.valida &&
    resultadoCategorias.dados.every(function (categoria) {
        return typeof categoria === "string";
    });

const categoriasSalvas = categoriasValidas
    ? resultadoCategorias.dados
    : [];

let categorias = [...new Set([
    ...categoriasPadrao,
    ...categoriasSalvas
])];

// Normaliza os dados dos produtos.
produtos = produtos.map(function (produto) {
    return {
        ...produto,
        estoque: Number.isInteger(Number(produto.estoque)) &&
            Number(produto.estoque) >= 0
            ? Number(produto.estoque)
            : 0,
        imagem: typeof produto.imagem === "string"
            ? produto.imagem
            : ""
    };
});

if (produtosValidos) {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

if (categoriasValidas) {
    localStorage.setItem("categorias", JSON.stringify(categorias));
}


// ========================================
// ELEMENTOS DO HTML
// ========================================

const formularioProduto = document.getElementById("form-produto");
const formularioCategoria = document.getElementById("form-categoria");

const listaProdutos = document.getElementById("lista-produtos-admin");
const listaCategorias = document.getElementById("lista-categorias");

const selectCategoria = document.getElementById("categoria-produto");
const campoImagem = document.getElementById("imagem-produto");

const mensagemProduto = document.getElementById("mensagem-produto");
const mensagemCategoria = document.getElementById("mensagem-categoria");

function mostrarMensagem(elemento, mensagem) {
    if (elemento) {
        elemento.textContent = mensagem;
    }
}

function desabilitarFormulario(formulario) {
    if (!formulario) return;

    formulario.querySelectorAll("input, textarea, select, button")
        .forEach(function (campo) {
            campo.disabled = true;
        });
}

if (!produtosValidos) {
    if (listaProdutos) {
        listaProdutos.textContent =
            "Os dados dos produtos estão inválidos. O gerenciamento foi desativado.";
    }

    desabilitarFormulario(formularioProduto);
}

if (!categoriasValidas) {
    desabilitarFormulario(formularioCategoria);
}


// ========================================
// MOSTRAR CATEGORIAS
// ========================================

function mostrarCategorias() {
    if (!listaCategorias || !selectCategoria) return;

    listaCategorias.replaceChildren();

    selectCategoria.innerHTML =
        '<option value="">Selecione uma categoria</option>';

    categorias.forEach(function (categoria, indice) {
        const opcao = document.createElement("option");

        opcao.value = categoria;
        opcao.textContent = categoria;

        selectCategoria.appendChild(opcao);

        const item = document.createElement("div");
        const nome = document.createElement("span");
        const botaoRemover = document.createElement("button");

        nome.textContent = categoria;

        botaoRemover.textContent = "Remover";
        botaoRemover.type = "button";

        botaoRemover.addEventListener("click", function () {
            removerCategoria(indice);
        });

        item.append(nome, botaoRemover);
        listaCategorias.appendChild(item);
    });

    if (!categoriasValidas) {
        listaCategorias.textContent =
            "Os dados das categorias estão inválidos.";
    }
}


// ========================================
// ADICIONAR CATEGORIA
// ========================================

if (formularioCategoria && categoriasValidas) {
    formularioCategoria.addEventListener("submit", function (event) {
        event.preventDefault();

        const campoCategoria = document.getElementById("nome-categoria");
        const nomeCategoria = campoCategoria.value.trim();

        if (nomeCategoria === "") {
            mostrarMensagem(mensagemCategoria, "Digite o nome da categoria.");
            return;
        }

        const categoriaExiste = categorias.some(function (categoria) {
            return categoria.toLowerCase() === nomeCategoria.toLowerCase();
        });

        if (categoriaExiste) {
            mostrarMensagem(mensagemCategoria, "Essa categoria já existe.");
            return;
        }

        categorias.push(nomeCategoria);

        localStorage.setItem("categorias", JSON.stringify(categorias));

        formularioCategoria.reset();
        mostrarCategorias();

        mostrarMensagem(mensagemCategoria, "Categoria adicionada com sucesso!");
    });
}


// ========================================
// REMOVER CATEGORIA
// ========================================

function removerCategoria(indice) {
    const categoria = categorias[indice];

    if (categoria === undefined) return;

    if (categoriasPadrao.includes(categoria)) {
        mostrarMensagem(
            mensagemCategoria,
            "As categorias predefinidas não podem ser removidas."
        );
        return;
    }

    const categoriaEmUso = produtos.some(function (produto) {
        return produto.categoria === categoria;
    });

    if (categoriaEmUso) {
        mostrarMensagem(
            mensagemCategoria,
            "Não é possível remover uma categoria que possui produtos."
        );
        return;
    }

    if (!confirm("Deseja remover a categoria " + categoria + "?")) {
        return;
    }

    categorias.splice(indice, 1);

    localStorage.setItem("categorias", JSON.stringify(categorias));

    mostrarCategorias();

    mostrarMensagem(mensagemCategoria, "Categoria removida com sucesso!");
}


// ========================================
// CADASTRAR PRODUTO
// ========================================

if (formularioProduto && produtosValidos && categoriasValidas) {
    formularioProduto.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = document.getElementById("nome-produto").value.trim();
        const descricao = document.getElementById("descricao-produto").value.trim();
        const preco = Number(document.getElementById("preco-produto").value);
        const categoria = selectCategoria.value;
        const estoque = Number(document.getElementById("estoque-produto").value);

        if (nome === "" || descricao === "") {
            mostrarMensagem(mensagemProduto, "Preencha o nome e a descrição.");
            return;
        }

        if (!Number.isFinite(preco) || preco <= 0) {
            mostrarMensagem(mensagemProduto, "Informe um preço válido.");
            return;
        }

        if (!Number.isInteger(estoque) || estoque < 0) {
            mostrarMensagem(
                mensagemProduto,
                "O estoque deve ser um número inteiro igual ou maior que zero."
            );
            return;
        }

        if (!categorias.includes(categoria)) {
            mostrarMensagem(mensagemProduto, "Selecione uma categoria válida.");
            return;
        }

        const novoProduto = {
            id: Date.now(),
            nome: nome,
            descricao: descricao,
            preco: preco,
            categoria: categoria,
            estoque: estoque,
            imagem: campoImagem ? campoImagem.value.trim() : ""
        };

        produtos.push(novoProduto);

        localStorage.setItem("produtos", JSON.stringify(produtos));

        formularioProduto.reset();

        mostrarProdutos();

        mostrarMensagem(mensagemProduto, "Produto cadastrado com sucesso!");
    });
}


// ========================================
// MOSTRAR PRODUTOS
// ========================================

function mostrarProdutos() {
    if (!listaProdutos) return;

    listaProdutos.replaceChildren();

    if (!produtosValidos) {
        listaProdutos.textContent =
            "Os dados dos produtos estão inválidos.";
        return;
    }

    if (produtos.length === 0) {
        listaProdutos.textContent = "Nenhum produto cadastrado.";
        return;
    }

    produtos.forEach(function (produto, indice) {
        const item = document.createElement("article");

        const titulo = document.createElement("h4");
        titulo.textContent = produto.nome;

        const descricao = document.createElement("p");
        descricao.textContent = produto.descricao;

        const categoria = document.createElement("p");
        categoria.textContent = "Categoria: " + produto.categoria;

        const preco = document.createElement("p");
        preco.textContent = "Preço: " + Number(produto.preco).toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
        );

        const estoque = document.createElement("p");
        estoque.textContent = "Estoque: " + produto.estoque + " unidade(s)";

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar produto";

        botaoEditar.addEventListener("click", function () {
            editarProduto(indice);
        });

        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover produto";

        botaoRemover.addEventListener("click", function () {
            removerProduto(indice);
        });

        item.append(
            titulo,
            descricao,
            categoria,
            preco,
            estoque,
            botaoEditar,
            botaoRemover
        );

        listaProdutos.appendChild(item);
    });
}


// ========================================
// EDITAR PRODUTO
// ========================================

function editarProduto(indice) {
    const produto = produtos[indice];

    if (!produto) return;

    const novoNome = prompt("Nome do produto:", produto.nome);
    if (novoNome === null) return;

    if (novoNome.trim() === "") {
        alert("O nome não pode ficar vazio.");
        return;
    }

    const novaDescricao = prompt("Descrição:", produto.descricao);
    if (novaDescricao === null) return;

    if (novaDescricao.trim() === "") {
        alert("A descrição não pode ficar vazia.");
        return;
    }

    const novoPrecoTexto = prompt(
        "Preço em reais:",
        String(produto.preco).replace(".", ",")
    );

    if (novoPrecoTexto === null) return;

    const novoPreco = Number(novoPrecoTexto.trim().replace(",", "."));

    if (!Number.isFinite(novoPreco) || novoPreco <= 0) {
        alert("Informe um preço válido.");
        return;
    }

    const novoEstoqueTexto = prompt(
        "Quantidade em estoque:",
        String(produto.estoque)
    );

    if (novoEstoqueTexto === null) return;

    const novoEstoque = Number(novoEstoqueTexto);

    if (!Number.isInteger(novoEstoque) || novoEstoque < 0) {
        alert("Informe um estoque válido.");
        return;
    }

    const novaImagem = prompt(
        "Caminho da imagem do produto:",
        produto.imagem || ""
    );

    if (novaImagem === null) return;

    produto.nome = novoNome.trim();
    produto.descricao = novaDescricao.trim();
    produto.preco = novoPreco;
    produto.estoque = novoEstoque;
    produto.imagem = novaImagem.trim();

    localStorage.setItem("produtos", JSON.stringify(produtos));

    mostrarProdutos();

    mostrarMensagem(mensagemProduto, "Produto atualizado com sucesso!");
}


// ========================================
// REMOVER PRODUTO
// ========================================

function removerProduto(indice) {
    const produto = produtos[indice];

    if (!produto) return;

    if (!confirm("Deseja remover o produto " + produto.nome + "?")) {
        return;
    }

    produtos.splice(indice, 1);

    localStorage.setItem("produtos", JSON.stringify(produtos));

    mostrarProdutos();

    mostrarMensagem(mensagemProduto, "Produto removido com sucesso!");
}


// ========================================
// INICIALIZAR PAINEL
// ========================================

mostrarCategorias();
mostrarProdutos();