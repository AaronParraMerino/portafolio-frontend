import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { FiArrowLeft, FiCheck, FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import '../../../dashboard/styles/dashboard.css';
import '../../../dashboard/view/styles/view.css';
import '../styles/portfolio.css';

import ViewOsFrame from '../../../dashboard/view/components/ViewOsFrame';
import ViewHero from '../../../dashboard/view/components/ViewHero';
import ViewIdentity from '../../../dashboard/view/components/ViewIdentity';
import ViewStats from '../../../dashboard/view/components/ViewStats';
import ViewSkills from '../../../dashboard/view/components/ViewSkills';
import ViewExperience from '../../../dashboard/view/components/ViewExperience';
import ViewProjects from '../../../dashboard/view/components/ViewProjects';
import { FONTS, getAutoTextColor, getFullName } from '../../../dashboard/view/model/viewModel';
import { usePublicPortfolio } from '../hooks/usePublicPortfolio';
import { useLanguage } from '../../../../core/i18n';
import {
  createPrivateChatRequest,
  fetchProfileContactState,
  unblockPrivateChat,
} from '../../../messaging/services/messagingService';
import { getStoredUser } from '../../../../shared/utils/authStorage';
import usePausedAccount from '../../../../shared/hooks/usePausedAccount';

function PublicPortfolioBackButton() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const backLabel = typeof state.backLabel === 'string' ? state.backLabel : t('publicPortfolio.backDefault');
  const backFallback = typeof state.backFallback === 'string' ? state.backFallback : '/portafolios';
  const hasPreviousEntry = typeof window !== 'undefined'
    && window.history.length > 1
    && location.key !== 'default';

  const handleBack = () => {
    if (hasPreviousEntry) {
      navigate(-1);
      return;
    }

    navigate(backFallback, { replace: true });
  };

  return (
    <div className="public-portfolio-backbar">
      <button
        type="button"
        className="public-portfolio-backbtn"
        onClick={handleBack}
        aria-label={backLabel}
      >
        <FiArrowLeft aria-hidden="true" size={17} />
        <span>{backLabel}</span>
      </button>
      <span className="public-portfolio-backhint">{t('publicPortfolio.previousView')}</span>
    </div>
  );
}

function getCurrentUserId() {
  const user = getStoredUser();
  return Number(user?.id_usuario || user?.id || user?.idUsuario || 0);
}

function PublicPortfolioContact({ ownerId }) {
  const paused = usePausedAccount();
  const [contactState, setContactState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const currentUserId = getCurrentUserId();
  const canLoad = Boolean(ownerId && currentUserId && Number(ownerId) !== Number(currentUserId));

  const loadContactState = useCallback(async () => {
    if (!canLoad) return;

    setLoading(true);
    setError('');

    try {
      setContactState(await fetchProfileContactState(ownerId));
    } catch (err) {
      setError(err.message || 'No se pudo cargar el estado de contacto.');
    } finally {
      setLoading(false);
    }
  }, [canLoad, ownerId]);

  useEffect(() => {
    loadContactState();
  }, [loadContactState]);

  if (!canLoad) return null;
  if (contactState?.estado === 'propio_perfil' || contactState?.estado === 'bloqueado_por_otro') return null;

  const estado = contactState?.estado;
  const buttonLabel = contactState?.boton || 'Contactarme por la aplicacion';
  const canCreateRequest = estado === 'sin_relacion';
  const canOpenChat = estado === 'chat_activo' && contactState?.id_chat;
  const canUnblock = estado === 'bloqueado_por_mi' && contactState?.id_chat;
  const disabled = loading || acting || estado === 'solicitud_enviada' || estado === 'cooldown' || (paused && !canOpenChat);

  const handlePrimary = async () => {
    setFeedback('');
    setError('');

    if (canOpenChat) {
      window.dispatchEvent(new CustomEvent('folio:open-messaging-center'));
      return;
    }

    if (paused) return;

    if (canUnblock) {
      setActing(true);
      try {
        await unblockPrivateChat(contactState.id_chat);
        setFeedback('Interacciones restauradas.');
        await loadContactState();
      } catch (err) {
        setError(err.message || 'No se pudo restaurar la interaccion.');
      } finally {
        setActing(false);
      }
      return;
    }

    if (canCreateRequest) {
      setModalOpen(true);
    }
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (paused) return;

    const cleanMessage = message.trim();
    if (!cleanMessage) {
      setError('Escribe un mensaje inicial.');
      return;
    }

    setActing(true);
    setError('');

    try {
      await createPrivateChatRequest(ownerId, cleanMessage);
      setFeedback('Solicitud enviada.');
      setMessage('');
      setModalOpen(false);
      await loadContactState();
    } catch (err) {
      setError(err.message || 'No se pudo enviar la solicitud.');
    } finally {
      setActing(false);
    }
  };

  return (
    <section className="public-contact-card">
      <div>
        <strong>Contacto por la aplicacion</strong>
        <span>{paused ? 'Cuenta en pausa: solo puedes consultar este portafolio.' : feedback || error || 'Inicia una conversacion privada desde CreaFolio.'}</span>
      </div>

      <button
        type="button"
        className="public-contact-btn"
        disabled={disabled || (!canCreateRequest && !canOpenChat && !canUnblock)}
        onClick={handlePrimary}
      >
        {canUnblock ? <FiCheck /> : <FiMessageSquare />}
        {loading ? 'Cargando...' : buttonLabel}
      </button>

      {modalOpen && (
        <div className="public-contact-modal-backdrop" role="presentation" onClick={() => !acting && setModalOpen(false)}>
          <form className="public-contact-modal" onSubmit={submitRequest} onClick={(event) => event.stopPropagation()}>
            <div className="public-contact-modal-head">
              <div>
                <strong>Enviar solicitud de chat</strong>
                <span>Este mensaje llegara como solicitud personal.</span>
              </div>
              <button type="button" onClick={() => !acting && setModalOpen(false)} aria-label="Cerrar">
                <FiX />
              </button>
            </div>

            <textarea
              value={message}
              maxLength={1000}
              placeholder="Escribe el motivo de contacto"
              disabled={paused || acting}
              onChange={(event) => setMessage(event.target.value)}
            />

            <div className="public-contact-modal-actions">
              <button type="button" className="public-contact-secondary" disabled={acting} onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="public-contact-btn" disabled={paused || acting || !message.trim()}>
                <FiSend />
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default function PortfolioPage() {
  const { t } = useLanguage();
  const { userId } = useParams();
  const { data, loading, error } = usePublicPortfolio(userId);
  const {
    perfil,
    redes = [],
    stats = [],
    habilidades,
    experiencias = [],
    proyectos = [],
    config,
  } = data;

  const selectedFont = FONTS.find(font => font.id === config?.fontId) || FONTS[0];
  const resolvedTextColor = config?.textColorAuto
    ? getAutoTextColor(config?.cardBg || '#ffffff')
    : (config?.textColor || '#111827');
  const visibilidad = config?.visibilidad || {};
  const title = `${getFullName(perfil)} - ${t('publicPortfolio.titleSuffix')}`;
  const hasPortfolioContent = Boolean(perfil)
    || redes.length > 0
    || stats.length > 0
    || (habilidades?.tecnicas || []).length > 0
    || (habilidades?.blandas || []).length > 0
    || experiencias.length > 0
    || proyectos.length > 0;

  if (loading && !hasPortfolioContent) {
    return (
      <div className="vw-page public-portfolio-page">
        <div className="page public-portfolio-main">
          <PublicPortfolioBackButton />
          <div className="dash-loading dash-loading--page" role="status" aria-live="polite">
            <span className="dash-loading-spinner" />
            <span>{t('publicPortfolio.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && error && !hasPortfolioContent) {
    return (
      <div className="vw-page public-portfolio-page">
        <div className="page public-portfolio-main">
          <PublicPortfolioBackButton />
          <section className="public-portfolio-state">
            <h1>{t('publicPortfolio.unavailableTitle')}</h1>
            <p>{error}</p>
            <Link className="public-portfolio-link" to="/portafolios">
              {t('publicPortfolio.backToPortfolios')}
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className="vw-page public-portfolio-page"
      style={{
        '--hero-bg': config?.heroColor || '#0c1a2e',
        '--avatar-bg': config?.avatarColor || '#0077b7',
        '--accent': config?.accentColor || '#0077b7',
        '--card-bg': config?.cardBg || '#ffffff',
        '--pf-font': selectedFont.value,
        '--text-color': resolvedTextColor,
      }}
    >
      <div className="page public-portfolio-main">
        <PublicPortfolioBackButton />
        <ViewOsFrame frameId={config?.frameId || 'mac'} title={title}>
          <ViewHero perfil={perfil} config={config} />

          <PublicPortfolioContact ownerId={userId} />

          <ViewIdentity
            perfil={perfil}
            redes={redes}
            disponible={config?.disponible}
            visibilidad={visibilidad}
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
            showUnvalidatedParticipants
          />
        </ViewOsFrame>
      </div>
    </div>
  );
}
