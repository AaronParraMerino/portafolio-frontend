// src/features/dashboard/view/pages/ViewPage.jsx

import { useState } from 'react';
import { FiCheck, FiEyeOff, FiSettings } from 'react-icons/fi';
import '../styles/view.css';

import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import Header from '../../layout/Header';

import { useView } from '../hooks/useView';
import { getFullName, FONTS, getAutoTextColor } from '../model/viewModel';

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

  const title = `${getFullName(perfil)} - Portafolio`;
  const visibilidad = config?.visibilidad || {};
  const isPublished = Boolean(config?.publicado);

  const handlePublish = async () => {
    await publicar(publishTarget !== false);
    setPublishTarget(null);
  };

  const selectedFont = FONTS.find(font => font.id === config?.fontId) || FONTS[0];

  const resolvedTextColor = config?.textColorAuto
    ? getAutoTextColor(config?.cardBg || '#ffffff')
    : (config?.textColor || '#111827');

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
      }}
    >
      <Header
        title="Vista Portafolio"
        actions={[
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

        <ViewOsFrame frameId={config?.frameId || 'mac'} title={title}>
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

      <ViewToast toast={toast} />
    </div>
  );
}
