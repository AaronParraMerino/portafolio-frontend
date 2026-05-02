// src/features/dashboard/view/pages/ViewPage.jsx

import { useState } from 'react';
import '../styles/view.css';

import ConfirmModal from '../../../../shared/ui/ConfirmModal';

import { useView } from '../hooks/useView';
import { getFullName, FONTS, getAutoTextColor } from '../model/viewModel';

import ViewHeader from '../components/ViewHeader';
import ViewOsFrame from '../components/ViewOsFrame';
import ViewHero from '../components/ViewHero';
import ViewIdentity from '../components/ViewIdentity';
import ViewStats from '../components/ViewStats';
import ViewSkills from '../components/ViewSkills';
import ViewExperience from '../components/ViewExperience';
import ViewProjects from '../components/ViewProjects';
import ViewToast from '../components/ViewToast';
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
    updateConfig,
    updatePerfil,
    resetConfig,
    publicar,
  } = useView();

  const [configOpen, setConfigOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const title = `${getFullName(perfil)} — Portafolio`;
  const visibilidad = config?.visibilidad || {};

  const handlePublish = async () => {
    await publicar();
    setPublishOpen(false);
  };
  const selectedFont = FONTS.find(font => font.id === config?.fontId) || FONTS[0];

    const resolvedTextColor = config?.textColorAuto
    ? getAutoTextColor(config?.cardBg || '#ffffff')
    : (config?.textColor || '#111827');
  
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
      <ViewHeader
        guardando={guardando}
        onPersonalizar={() => setConfigOpen(true)}
        onPublicar={() => setPublishOpen(true)}
      />

      <main className="page">
        <ViewOsFrame frameId={config?.frameId || 'mac'} title={title}>
          <ViewHero perfil={perfil} config={config} />

          <ViewIdentity
            perfil={perfil}
            redes={redes}
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
        onChange={updateConfig}
        onReset={resetConfig}
        onClose={() => setConfigOpen(false)}
      />

      <ConfirmModal
        open={publishOpen}
        variant="green"
        icon="check"
        title="Publicar portafolio"
        subtitle="Confirmación de publicación"
        message="¿Deseas publicar esta vista mock del portafolio?"
        confirmLabel="Sí, publicar"
        cancelLabel="Cancelar"
        loading={guardando}
        onConfirm={handlePublish}
        onClose={() => setPublishOpen(false)}
      />

      <ViewToast toast={toast} />
    </div>
  );
}