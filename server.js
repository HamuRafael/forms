const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf'); // Importa o jsPDF
require('jspdf-autotable'); // Importa o plugin autotable

const app = express();

// Configurações
const PORT = 3000; // Porta em que o servidor irá rodar

// Middleware
app.use(bodyParser.json({ limit: '50mb' })); // Aumentado o limite para 50mb
app.use(express.static(path.join(__dirname, 'public'))); // Servir arquivos estáticos

// Rota para receber os dados do formulário
app.post('/submit', (req, res) => {
  const data = req.body;

  // Diretório onde os PDFs serão salvos
  const pdfDirectory = path.join(__dirname, 'pdfs');

  // Certifique-se de que o diretório existe
  if (!fs.existsSync(pdfDirectory)) {
    fs.mkdirSync(pdfDirectory);
  }

  // Caminho completo para salvar o PDF
  const pdfPath = path.join(pdfDirectory, `${data['Número da Margem']}.pdf`);

  // Gerar o PDF
  generatePDF(data, pdfPath)
    .then(() => {
      res.json({ status: 'sucesso' });
    })
    .catch((err) => {
      console.error('Erro ao gerar o PDF:', err);
      res.status(500).json({ status: 'erro', message: 'Erro ao gerar o PDF' });
    });
});

// Função para gerar o PDF
function generatePDF(data, pdfPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();

      // Adicionar o título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Formulário de Margem', 105, 20, null, null, 'center');

      // Dados do formulário
      const tableData = [
        ['Número da Margem', data['Número da Margem']],
        ['Nome do Solicitante', data['Nome do Solicitante']],
        ['Vínculo', data['Vínculo']],
        ['Data de Emissão do Cancelamento', data['Data de Emissão do Cancelamento']],
        ['Servidor que Atendeu', data['Servidor que Atendeu']],
        ['Tipo de Documento', data['Tipo de Documento']]
      ];

      // Adicionar a tabela ao PDF
      doc.autoTable({
        startY: 30,
        head: [['Campo', 'Valor']],
        body: tableData,
        styles: {
          fontSize: 12
        },
        headStyles: {
          fillColor: [59, 89, 152], // Cor de fundo do cabeçalho (azul)
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245] // Cor de fundo alternada para as linhas
        },
        columnStyles: {
          0: { cellWidth: 60 }, // Largura da coluna dos campos
          1: { cellWidth: 120 } // Largura da coluna dos valores
        }
      });

      // Adicionar a assinatura
      const imgData = data['Assinatura'];
      const imgWidth = 100;
      const imgHeight = 50;
      const positionY = doc.lastAutoTable.finalY + 20;

      doc.setFont('helvetica', 'bold');
      doc.text('Assinatura:', 14, positionY);

      doc.addImage(imgData, 'PNG', 14, positionY + 5, imgWidth, imgHeight);

      // Obter o PDF como Buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      // Salvar o PDF no servidor
      fs.writeFile(pdfPath, pdfBuffer, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
