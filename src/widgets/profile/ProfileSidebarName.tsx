type ProfileSidebarNameProps = {
  name: string;
};

function splitDisplayName(name: string): string[] {
  return name.trim().split(/\s+/).filter(Boolean);
}

export function ProfileSidebarName({ name }: ProfileSidebarNameProps) {
  const parts = splitDisplayName(name);

  if (parts.length === 0) {
    return <p className="profile-sidebar__name">&nbsp;</p>;
  }

  return (
    <p className="profile-sidebar__name">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="profile-sidebar__name-part">
          {part}
        </span>
      ))}
    </p>
  );
}
