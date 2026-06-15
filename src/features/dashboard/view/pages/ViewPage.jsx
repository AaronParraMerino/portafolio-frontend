// src/features/dashboard/view/pages/ViewPage.jsx

import { useRef, useState } from 'react';
import '../styles/view.css';

import ConfirmModal from '../../../../shared/ui/ConfirmModal';
import BackgroundSaveIndicator from '../../../../shared/ui/BackgroundSaveIndicator';
import Header from '../../layout/Header';
import {
  DashboardCheckIcon,
  DashboardDownloadIcon,
  DashboardHiddenIcon,
  DashboardSettingsIcon,
} from '../../layout/DashboardIcons';

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
import { useLanguage } from '../../../../core/i18n';

export default function ViewPage() {
  const { t } = useLanguage();
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

  const title = `${getFullName(perfil)} - ${t('view.portfolio.titleSuffix')}`;
  const visibilidad = config?.visibilidad || {};
  const isPublished = Boolean(config?.publicado);

  const handlePublish = () => {
    const shouldPublish = publishTarget !== false;
    setPublishTarget(null);
    publicar(shouldPublish).catch(() => {});
  };

  const handleSaveConfig = (draftConfig) => {
    setConfigOpen(false);
    saveCurrentConfig(draftConfig).catch(() => {});
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
    } catch {
      setExportError(t('view.export.error.download'));
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
        <Header title={t('view.header.title')} />

        <main className="page">
          <div className="dash-loading dash-loading--page" role="status" aria-live="polite">
            <span className="dash-loading-spinner" />
            <span>{t('view.loading')}</span>
          </div>
        </main>
      </div>
    );
  }

  if (!loading && error && !hasPortfolioContent) {
    return (
      <div className="vw-page">
        <Header title={t('view.header.title')} />

        <main className="page">
          <ViewPreviewNotice
            loading={false}
            dataSource={dataSource}
            error={error}
          />

          <div className="dash-error-state dash-error-state--page">
            {t('view.error.load')}
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
        title={t('view.header.title')}
        actions={[
          {
            label: t('view.action.download'),
            title: t('view.action.downloadTitle'),
            icon: <DashboardDownloadIcon />,
            variant: 'secondary',
            disabled: !hasPortfolioContent,
            onClick: () => {
              setExportError('');
              setDownloadOpen(true);
            },
          },
          {
            label: t('view.action.customize'),
            title: t('view.action.customizeTitle'),
            icon: <DashboardSettingsIcon />,
            variant: 'secondary',
            disabled: guardando,
            onClick: () => setConfigOpen(true),
          },
          {
            label: isPublished ? t('view.action.hide') : t('view.action.publish'),
            loadingLabel: isPublished ? t('view.action.hiding') : t('view.action.publishing'),
            title: isPublished ? t('view.action.hideTitle') : t('view.action.publishTitle'),
            icon: isPublished ? <DashboardHiddenIcon /> : <DashboardCheckIcon />,
            loading: false,
            disabled: guardando,
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
              fetchParticipants
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
        onSave={handleSaveConfig}
        saving={false}
        onClose={() => setConfigOpen(false)}
      />

      <ConfirmModal
        open={publishTarget !== null}
        variant={publishTarget === false ? 'yellow' : 'green'}
        icon={publishTarget === false ? 'warning' : 'check'}
        title={publishTarget === false ? t('view.publish.hideTitle') : t('view.publish.publishTitle')}
        subtitle={publishTarget === false ? t('view.publish.privacyConfirmation') : t('view.publish.publishConfirmation')}
        message={
          publishTarget === false
            ? t('view.publish.hideMessage')
            : t('view.publish.publishMessage')
        }
        confirmLabel={publishTarget === false ? t('view.publish.confirmHide') : t('view.publish.confirmPublish')}
        cancelLabel={t('actions.cancel')}
        loading={false}
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
      <BackgroundSaveIndicator active={guardando} label={t('actions.saving')} />
    </div>
  );
}
