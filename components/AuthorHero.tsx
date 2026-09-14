export default function AuthorHero({
  name,
  avatar,
  count,
}: {
  name: string;
  avatar: string;
  count: number;
}) {
  return (
    <header className="btt-author-hero">
      <div className="btt-author-hero__inner">
        <div className="btt-author-hero__avatar">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              src={avatar}
              className="avatar avatar-120 photo"
              height="120"
              width="120"
              decoding="async"
            />
          ) : null}
        </div>
        <div className="btt-author-hero__info">
          <h1 className="btt-author-hero__name">{name}</h1>
          <p className="btt-author-hero__stats">{count} articles</p>
        </div>
      </div>
    </header>
  );
}
