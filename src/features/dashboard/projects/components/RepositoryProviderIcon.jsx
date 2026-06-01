import { FaGithub, FaGitlab } from 'react-icons/fa';

export function getRepositoryProvider(value = '') {
  const provider = typeof value === 'object'
    ? value?.provider || value?.proveedor || ''
    : '';
  const url = typeof value === 'object'
    ? value?.url || value?.url_repositorio || ''
    : value;

  if (String(provider).toLowerCase() === 'gitlab' || /gitlab\.com/i.test(String(url))) {
    return 'gitlab';
  }

  return 'github';
}

export default function RepositoryProviderIcon({ provider = 'github', className = '' }) {
  const normalizedProvider = getRepositoryProvider({ provider });
  const Icon = normalizedProvider === 'gitlab' ? FaGitlab : FaGithub;

  return (
    <Icon
      className={`prj-repo-provider-icon ${normalizedProvider}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    />
  );
}
