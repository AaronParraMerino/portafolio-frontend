export default function PublicCatalogSkeleton({ count = 6 }) {
  return Array.from({ length: count }, (_, index) => (
    <article className="pubcat-skeleton" key={index} aria-hidden="true">
      <span className="pubcat-skeleton__media" />
      <span className="pubcat-skeleton__title" />
      <span className="pubcat-skeleton__line" />
      <span className="pubcat-skeleton__line pubcat-skeleton__line--short" />
      <span className="pubcat-skeleton__footer" />
    </article>
  ));
}
