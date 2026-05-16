// src/features/dashboard/view/pages/ViewPage.jsx

import { useRef, useState } from 'react';
import { FiCheck, FiDownload, FiEyeOff, FiSettings } from 'react-icons/fi';
import '../styles/view.css';

import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import Header from '../../layout/Header';

import { useView } from '../hooks/useView';
import { getFullName, FONTS, getAutoTextColor, getLuminance } from '../model/viewModel';

import ViewOsFrame from '../components/ViewOsFrame';
import ViewHero from '../components/ViewHero';
import ViewIdentity from '../components/ViewIdentity';
import ViewStats from '../components/ViewStats';
import ViewSkills from '../components/ViewSkills';
import ViewExperience from '../components/ViewExperience';
import ViewProjects from '../components/ViewProjects';
import ViewToast from '../components/ViewToast';
import ViewPreviewNotice from '../components/ViewPreviewNotice';
import ViewConfigModal from '../modal/ViewConfigModal';
import ViewDownloadModal from '../modal/ViewDownloadModal';
import { exportPortfolio } from '../services/portfolioExportService';

export default function ViewPage() {
  const {
    perfil,
    redes,
    stats,
    habilidades,
    experiencias,
    proyectos,
    config,
    toast,
    guardando,
    loading,
    dataSource,
    error,
    updatePerfil,
    saveCurrentConfig,
    publicar,
  } = useView();

  const [configOpen, setConfigOpen] = useState(false);
  const [publishTarget, setPublishTarget] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [exporting, setExporting] = useState('');
  const [exportError, setExportError] = useState('');
  const portfolioRef = useRef(null);

  const title = `${getFullName(perfil)} - Portafolio`;
  const visibilidad = config?.visibilidad || {};
  const isPublished = Boolean(config?.publicado);

  const handlePublish = async () => {
    await publicar(publishTarget !== false);
    setPublishTarget(null);
  };

  const handleExport = async (format) => {
    setExporting(format);
    setExportError('');

    try {
      await exportPortfolio(portfolioRef.current, {
        format,
        title: getFullName(perfil),
      });
      setDownloadOpen(false);
    } catch (err) {
      setExportError(err.message || 'No se pudo descargar el portafolio.');
    } finally {
      setExporting('');
    }
  };

  const selectedFont = FONTS.find(font => font.id === config?.fontId) || FONTS[0];

  const resolvedTextColor = config?.textColorAuto
    ? getAutoTextColor(config?.cardBg || '#ffffff')
    : (config?.textColor || '#111827');
  const isDarkCard = getLuminance(config?.cardBg || '#ffffff') <= 0.45;
  const isLightText = getLuminance(resolvedTextColor) > 0.45;
  const mutedTextColor = isLightText ? '#d1d5db' : '#6b7280';
  const softSurfaceBg = isDarkCard ? 'rgba(255,255,255,.08)' : '#f8fafc';
  const softSurfaceHoverBg = isDarkCard ? 'rgba(255,255,255,.12)' : '#e8f4fb';
  const softBorderColor = isDarkCard ? 'rgba(255,255,255,.16)' : '#e5e7eb';

  const hasPortfolioContent = Boolean(perfil)
    || redes.length > 0
    || stats.length > 0
    || (habilidades?.tecnicas || []).length > 0
    || (habilidades?.blandas || []).length > 0
    || experiencias.length > 0
    || proyectos.length > 0;

  if (loading && !hasPortfolioContent) {
    return (
      <div className="vw-page">
        <Header title="Vista Portafolio" />

        <main className="page">
          <div className="dash-loading dash-loading--page" role="status" aria-live="polite">
            <span className="dash-loading-spinner" />
            <span>Cargando vista portafolio...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!loading && error && !hasPortfolioContent) {
    return (
      <div className="vw-page">
        <Header title="Vista Portafolio" />

        <main className="page">
          <ViewPreviewNotice
            loading={false}
            dataSource={dataSource}
            error={error}
          />

          <div className="dash-error-state dash-error-state--page">
            No se pudo cargar la vista del portafolio.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="vw-page"
      style={{
        '--hero-bg': config?.heroColor || '#0c1a2e',
        '--avatar-bg': config?.avatarColor || '#0077b7',
        '--accent': config?.accentColor || '#0077b7',
        '--card-bg': config?.cardBg || '#ffffff',
        '--pf-font': selectedFont.value,
        '--text-color': resolvedTextColor,
        '--muted-text-color': mutedTextColor,
        '--soft-surface-bg': softSurfaceBg,
        '--soft-surface-hover-bg': softSurfaceHoverBg,
        '--soft-border-color': softBorderColor,
        '--github-link-color': isDarkCard ? '#f9fafb' : '#24292f',
      }}
    >
      <Header
        title="Vista Portafolio"
        actions={[
          {
            label: 'Descargar',
            title: 'Descargar portafolio',
            icon: <FiDownload />,
            variant: 'secondary',
            disabled: !hasPortfolioContent,
            onClick: () => {
              setExportError('');
              setDownloadOpen(true);
            },
          },
          {
            label: 'Personalizar',
            title: 'Personalizar vista',
            icon: <FiSettings />,
            variant: 'secondary',
            onClick: () => setConfigOpen(true),
          },
          {
            label: isPublished ? 'Ocultar' : 'Publicar',
            loadingLabel: isPublished ? 'Ocultando...' : 'Publicando...',
            title: isPublished ? 'Ocultar portafolio' : 'Publicar portafolio',
            icon: isPublished ? <FiEyeOff /> : <FiCheck />,
            loading: guardando,
            variant: isPublished ? 'secondary' : undefined,
            onClick: () => setPublishTarget(!isPublished),
          },
        ]}
      />

      <main className="page">
        <ViewPreviewNotice
          loading={loading}
          dataSource={dataSource}
          error={error}
        />

        <div ref={portfolioRef} className="portfolio-export-target">
          <ViewOsFrame frameId={config?.frameId || 'none'} title={title}>
            <ViewHero perfil={perfil} config={config} />

            <ViewIdentity
              perfil={perfil}
              redes={redes}
              disponible={config?.disponible}
              visibilidad={visibilidad}
              onPerfilChange={updatePerfil}
            />

            <ViewStats
              stats={stats}
              visibilidad={visibilidad}
            />

            <ViewSkills
              habilidades={habilidades}
              visibilidad={visibilidad}
            />

            <ViewExperience
              experiencias={experiencias}
              visibilidad={visibilidad}
            />

            <ViewProjects
              proyectos={proyectos}
              visibilidad={visibilidad}
            />
          </ViewOsFrame>
        </div>
      </main>

      <ViewConfigModal
        open={configOpen}
        config={config}
        data={{
          perfil,
          redes,
          stats,
          habilidades,
          experiencias,
          proyectos,
        }}
        onSave={saveCurrentConfig}
        saving={guardando}
        onClose={() => setConfigOpen(false)}
      />

      <ConfirmModal
        open={publishTarget !== null}
        variant={publishTarget === false ? 'yellow' : 'green'}
        icon={publishTarget === false ? 'warning' : 'check'}
        title={publishTarget === false ? 'Ocultar portafolio' : 'Publicar portafolio'}
        subtitle={publishTarget === false ? 'Confirmacion de privacidad' : 'Confirmacion de publicacion'}
        message={
          publishTarget === false
            ? 'El portafolio dejara de estar disponible en la vista publica y en los listados.'
            : 'Deseas publicar esta vista del portafolio con la visibilidad configurada?'
        }
        confirmLabel={publishTarget === false ? 'Si, ocultar' : 'Si, publicar'}
        cancelLabel="Cancelar"
        loading={guardando}
        onConfirm={handlePublish}
        onClose={() => setPublishTarget(null)}
      />

      <ViewDownloadModal
        open={downloadOpen}
        exporting={exporting}
        error={exportError}
        onExport={handleExport}
        onClose={() => {
          if (!exporting) {
            setDownloadOpen(false);
          }
        }}
      />

      <ViewToast toast={toast} />
    </div>
  );
}
