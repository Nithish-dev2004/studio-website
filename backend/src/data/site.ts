// The only site detail the backend needs: the studio name (used in notification emails).
// Set STUDIO_NAME in backend/.env.local to change it.

export const siteConfig = {
  name: process.env.STUDIO_NAME ?? "Sivagangai Stories",
};
