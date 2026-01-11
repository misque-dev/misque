export const BottomBar = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-12 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        &copy; {currentYear} Misque. MIT License.
      </p>
      <p className="text-sm text-muted-foreground">
        Built for the Muslim developer community.
      </p>
    </div>
  );
};
