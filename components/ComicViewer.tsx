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
  onRetryPanel: (panelId: string) => void;
  retryingPanelId: string | null;
}


/**
 * Creates a vibrant, comic-book-style background with a halftone dot pattern.
 * @returns A promise that resolves to a data URL for the background image, or null.
 */
const createComicBookBackground = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const A4_WIDTH = 595;
    const A4_HEIGHT = 842;
    const canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH;
    canvas.height = A4_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    // 1. Bright yellow background
    ctx.fillStyle = '#FFDE59'; // A classic, warm comic book yellow
    ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);

    // 2. Halftone dot pattern overlay
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; // A semi-transparent comic-style red/orange
    const radius = 2;
    const spacing = 12;

    for (let y = 0; y < A4_HEIGHT; y += spacing) {
      for (let x = 0; x < A4_WIDTH; x += spacing) {
        // Offset every other row for a more natural pattern
        const offsetX = (y / spacing) % 2 === 0 ? 0 : spacing / 2;
        ctx.beginPath();
        ctx.arc(x + offsetX, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Use a high-quality JPEG for the background
    resolve(canvas.toDataURL('image/jpeg', 0.8));
  });
};


export const ComicViewer: React.FC<ComicViewerProps> = ({ character, comicTitle, generatedComic, onStartOver, onRetryPanel, retryingPanelId }) => {
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
      
      // --- DYNAMIC BACKGROUND GENERATION ---
      setDownloadMessage('Creating theme...');
      const backgroundImageDataUrl = await createComicBookBackground();
      
      const addPageBackground = () => {
        if (backgroundImageDataUrl) {
          pdf.addImage(backgroundImageDataUrl, 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT, undefined, 'FAST');
        } else {
          pdf.setFillColor('#FFDE59'); // Fallback yellow
          pdf.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');
        }
      };
      
      // --- TITLE PAGE ---
      addPageBackground();
      
      // Add a semi-transparent backdrop for readability on the bright background
      pdf.setFillColor(15, 23, 42, 0.8); // slate-900 with 80% opacity
      const titlePlaqueMargin = 40;
      pdf.roundedRect(titlePlaqueMargin, A4_HEIGHT / 3 - 60, A4_WIDTH - titlePlaqueMargin * 2, 180, 10, 10, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#eff6ff'); // text-slate-100
      pdf.setFontSize(40);
      const titleLines = pdf.splitTextToSize(comicTitle, A4_WIDTH - 120);
      pdf.text(titleLines, A4_WIDTH / 2, A4_HEIGHT / 3, { align: 'center' });
      
      const titleHeight = pdf.getTextDimensions(titleLines).h;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#cbd5e1'); // slate-300
      pdf.setFontSize(20);
      pdf.text(`Featuring ${character.name}`, A4_WIDTH / 2, (A4_HEIGHT / 3) + titleHeight + 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor('#94a3b8'); // slate-400
      pdf.text(`Generated with Comic Crafter AI`, A4_WIDTH / 2, A4_HEIGHT - 40, { align: 'center' });

      const panelElements = document.querySelectorAll('.comic-panel-container');
      if (panelElements.length > 0) {
        
        // --- DYNAMIC 2x3 GRID LAYOUT ---
        const PANELS_PER_PAGE = 6;
        const totalPages = Math.ceil(panelElements.length / PANELS_PER_PAGE);
        
        for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
          pdf.addPage();
          addPageBackground();
          
          setDownloadMessage(`Processing page ${pageIndex + 1} of ${totalPages}...`);
          
          const pagePanels = Array.from(panelElements).slice(
            pageIndex * PANELS_PER_PAGE,
            (pageIndex + 1) * PANELS_PER_PAGE
          );

          // Calculate panel size to fit a 2x3 grid and center it
          const MARGIN = 40;
          const GAP_X = 20;
          const GAP_Y = 25;
          const contentWidth = A4_WIDTH - MARGIN * 2;
          const contentHeight = A4_HEIGHT - MARGIN * 2;
          
          const panelWidthFromCols = (contentWidth - GAP_X) / 2;
          const panelHeightFromRows = (contentHeight - (2 * GAP_Y)) / 3;
          const panelSize = Math.min(panelWidthFromCols, panelHeightFromRows);
          
          const gridWidth = 2 * panelSize + GAP_X;
          const gridHeight = 3 * panelSize + 2 * GAP_Y;
          const startX = (A4_WIDTH - gridWidth) / 2;
          const startY = (A4_HEIGHT - gridHeight) / 2;

          for (let i = 0; i < pagePanels.length; i++) {
            const panelEl = pagePanels[i] as HTMLElement;
            const canvas = await html2canvas(panelEl, { useCORS: true, scale: 2, backgroundColor: '#1e293b' });
            const imgData = canvas.toDataURL('image/png');

            const row = Math.floor(i / 2);
            const col = i % 2;

            const x = startX + col * (panelSize + GAP_X);
            const y = startY + row * (panelSize + GAP_Y);

            pdf.addImage(imgData, 'PNG', x, y, panelSize, panelSize, undefined, 'FAST');
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
          <ComicPanel 
            key={panel.id} 
            panel={panel} 
            panelNumber={index + 1} 
            onRetry={() => onRetryPanel(panel.id)}
            isRetrying={retryingPanelId === panel.id}
          />
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