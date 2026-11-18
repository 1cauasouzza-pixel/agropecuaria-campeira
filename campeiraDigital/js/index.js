
/* =========================================
   PÁGINA INICIAL - CAMPEIRA DIGITAL
========================================= */

const areaDestaques = document.getElementById("produtos-destaque");

if (areaDestaques) {
    let produtos = [];

    try {
        const dados = JSON.parse(
            localStorage.getItem("produtos") || "[]"
        );

        if (Array.isArray(dados)) {
            produtos = dados.filter(function (produto) {
                return produto !== null &&
                    typeof produto === "object" &&
                    !Array.isArray(produto);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }

    const produtosDisponiveis = produtos
        .filter(function (produto) {
            return Number.isFinite(Number(produto.estoque)) &&
                Number(produto.estoque) > 0;
        })
        .slice(0, 3);

    areaDestaques.replaceChildren();

    if (produtosDisponiveis.length === 0) {
        areaDestaques.textContent =
            "Nenhum produto disponível no momento.";
    } else {
        produtosDisponiveis.forEach(function (produto) {
            const artigo = document.createElement("article");
            artigo.className = "produto";

            const areaImagem = document.createElement("div");
            areaImagem.className = "produto-imagem";
            areaImagem.setAttribute("aria-label", "Imagem do produto");

            const icone = document.createElement("span");
            icone.textContent = "📦";
            icone.setAttribute("aria-hidden", "true");

            if (typeof produto.imagem === "string" && produto.imagem.trim()) {
                const imagem = document.createElement("img");
                imagem.src = produto.imagem;
                imagem.alt = [
                    produto.nome || "Produto",
                    produto.categoria || ""
                ].filter(Boolean).join(" - ");
                imagem.loading = "lazy";

                imagem.onerror = function () {
                    areaImagem.replaceChildren(icone);
                };

                areaImagem.appendChild(imagem);
            } else {
                areaImagem.appendChild(icone);
            }

            // Informações
            const informacoes = document.createElement("div");
            informacoes.className = "produto-info";

            const nome = document.createElement("h3");
            nome.textContent = produto.nome || "Produto sem nome";

            const categoria = document.createElement("p");
            categoria.className = "categoria-produto";
            categoria.textContent =
                produto.categoria || "Sem categoria";

            const descricao = document.createElement("p");
            descricao.textContent =
                produto.descricao || "Descrição não informada.";

            const preco = document.createElement("p");
            preco.className = "preco";

            const valor = Number(produto.preco);

            if (Number.isFinite(valor) && valor >= 0) {
                preco.textContent = valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });
            } else {
                preco.textContent = "Preço não informado";
            }

            const link = document.createElement("a");
            link.href = "produtos.html";
            link.className = "botao-produto";
            link.textContent = "Ver produtos";

            informacoes.append(
                nome,
                categoria,
                descricao,
                preco,
                link
            );

            artigo.append(areaImagem, informacoes);
            areaDestaques.appendChild(artigo);
        });
    }
}
