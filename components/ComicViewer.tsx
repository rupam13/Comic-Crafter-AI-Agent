import React from 'react';
import { useState } from 'react';
import type { Character, GeneratedPanel } from '../types';
import { ComicPanel } from './ComicPanel';
import { DownloadIcon } from './icons/DownloadIcon';
import { RestartIcon } from './icons/RestartIcon';


const importJsPDF = () => import('jspdf').then(module => module.default);
const importHtml2Canvas = () => import('html2canvas').then(module => module.default);

interface ComicViewerProps {
  character: Character;
  comicTitle: string;
  generatedComic: GeneratedPanel[];
  onStartOver: () => void;
}

export const ComicViewer: React.FC<ComicViewerProps> = ({ character, comicTitle, generatedComic, onStartOver }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('Download PDF');

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadMessage('Initializing...');
    try {
      const jsPDF = await importJsPDF();
      const html2canvas = await importHtml2Canvas();
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      pdf.setProperties({
        title: comicTitle,
        author: "Comic Crafter AI",
        subject: `A comic about ${character.name}`
      });

      const A4_WIDTH = 595;
      const A4_HEIGHT = 842;
      
      // --- START: TITLE PAGE ---
      setDownloadMessage('Creating title page...');
      // Set background color for title page
      pdf.setFillColor('#0f172a'); // bg-slate-900
      pdf.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');
      
      // Comic Title
      pdf.setFont('helvetica', 'bold'); // Using helvetica as Inter is not standard
      pdf.setTextColor('#eff6ff'); // text-slate-100
      pdf.setFontSize(48);
      const titleLines = pdf.splitTextToSize(comicTitle, A4_WIDTH - 80);
      pdf.text(titleLines, A4_WIDTH / 2, A4_HEIGHT / 3, { align: 'center' });
      
      // Subtitle with character name
      const titleHeight = pdf.getTextDimensions(titleLines).h;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#94a3b8'); // slate-400
      pdf.setFontSize(24);
      pdf.text(`Featuring ${character.name}`, A4_WIDTH / 2, (A4_HEIGHT / 3) + titleHeight + 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor('#3b82f6'); // blue-500
      pdf.text(`Generated with Comic Crafter AI`, A4_WIDTH / 2, A4_HEIGHT - 50, { align: 'center' });
      // --- END: TITLE PAGE ---

      const panelElements = document.querySelectorAll('.comic-panel-container');
      if (panelElements.length > 0) {
        const PANELS_PER_PAGE = 4;
        const totalPages = Math.ceil(panelElements.length / PANELS_PER_PAGE);
        
        for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
          pdf.addPage();
          
          // Add background color to the comic page
          pdf.setFillColor('#0f172a'); // bg-slate-900
          pdf.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');
          
          setDownloadMessage(`Processing page ${pageIndex + 1} of ${totalPages}...`);
          
          const pagePanels = Array.from(panelElements).slice(
            pageIndex * PANELS_PER_PAGE,
            (pageIndex + 1) * PANELS_PER_PAGE
          );

          const MARGIN = 40;
          const GAP = 20;
          
          const contentWidth = A4_WIDTH - MARGIN * 2;
          const panelWidth = (contentWidth - GAP) / 2;
          const panelHeight = panelWidth; // Since panels are square

          for (let i = 0; i < pagePanels.length; i++) {
            const panelEl = pagePanels[i] as HTMLElement;
            const canvas = await html2canvas(panelEl, { useCORS: true, scale: 2, backgroundColor: '#1e293b' });
            const imgData = canvas.toDataURL('image/png');

            const row = Math.floor(i / 2);
            const col = i % 2;

            const x = MARGIN + col * (panelWidth + GAP);
            const y = MARGIN + row * (panelHeight + GAP);

            pdf.addImage(imgData, 'PNG', x, y, panelWidth, panelHeight);
          }
        }
      }
      
      setDownloadMessage('Saving PDF...');
      const safeFileName = comicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`${safeFileName || 'comic'}.pdf`);

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Sorry, there was an issue creating the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
      setDownloadMessage('Download PDF');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight break-words">
          {comicTitle}
        </h2>
        <p className="text-slate-400 mt-2 text-lg md:text-xl">
          Featuring {character.name}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {generatedComic?.map((panel, index) => (
          <ComicPanel key={panel.id} panel={panel} panelNumber={index + 1} />
        ))}
      </div>
      <div className="text-center mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onStartOver}
          className="flex items-center justify-center gap-3 font-semibold text-lg tracking-wide border-2 border-slate-600 text-slate-300 py-3 px-10 rounded-md hover:bg-slate-700 hover:text-white transition-colors duration-200 w-full sm:w-auto"
        >
          <RestartIcon className="w-6 h-6"/>
          Create New Comic
        </button>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-3 font-semibold text-lg tracking-wide bg-blue-600 text-white py-3 px-10 rounded-md hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-wait transition-colors duration-200 w-full sm:w-auto"
        >
          <DownloadIcon className="w-6 h-6"/>
          {downloadMessage}
        </button>
      </div>
    </div>
  );
};