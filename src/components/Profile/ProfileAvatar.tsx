const ProfileAvatar: React.FC<{ firstName: string; photoUrl?: string }> = ({ firstName, photoUrl }) => {
    const avatarLetter = (firstName?.[0] ?? '?').toUpperCase();

    return photoUrl ? (
        <img
            src={photoUrl}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover"
            referrerPolicy="no-referrer"
        />
    ) : (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {avatarLetter}
        </div>
    );
};

export default ProfileAvatar;
