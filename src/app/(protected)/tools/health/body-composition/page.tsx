import { auth } from 'auth';
import Header from 'components/Header';
import Footer from 'components/Footer';
import BodyCompositionContent from '(protected)/tools/health/body-composition/components/BodyCompositionContent';
import { SingleQuery } from 'lib/dbAdapter';
import type { UserSettings } from 'lib/types/userSettings.zod';
import { getBodyCompositionEntries, saveBodyComposition } from '(protected)/tools/health/body-composition/actions';

async function getUserSettings(): Promise<UserSettings | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const result = await SingleQuery(`SELECT * FROM user_settings WHERE user_id = $1`, [session.user.id]);
  if (result.rows.length === 0) return null;
  const db = result.rows[0];
  return {
    general: {
      heightUnit: db.height_unit,
      weightUnit: db.weight_unit,
      distanceUnit: db.distance_unit,
      temperatureUnit: db.temperature_unit,
      timeFormat: db.time_format,
      dateFormat: db.date_format,
      language: db.language,
      sidebarExpandMode: db.sidebar_expand_mode || 'hover',
      notificationsEmail: db.notifications_email,
      notificationsText: db.notifications_text,
      notificationsApp: db.notifications_app,
      garminConnect: db.garmin_connect_settings || undefined,
    },
    fitness: db.fitness_settings || {},
    health: db.health_settings || {},
    lifestyle: db.lifestyle_settings || {},
    nutrition: db.nutrition_settings || {},
  } as UserSettings;
}

async function getBio(): Promise<{ date_of_birth?: string; gender?: string } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const result = await SingleQuery(
    `SELECT date_of_birth, gender FROM user_bio WHERE user_id = $1`,
    [session.user.id]
  );
  if (result.rows.length === 0) return null;
  return {
    date_of_birth: result.rows[0].date_of_birth,
    gender: result.rows[0].gender,
  };
}

async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const result = await SingleQuery('SELECT role FROM users WHERE id = $1', [session.user.id]);
  return result.rows[0]?.role === 'admin';
}

export default async function BodyCompositionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <>
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <Header />
          <div>Please sign in to access this feature.</div>
        </div>
        <Footer />
      </>
    );
  }

  const [settings, bio, admin, entries] = await Promise.all([
    getUserSettings(),
    getBio(),
    isAdmin(),
    getBodyCompositionEntries({ userId: parseInt(session.user.id) }),
  ]);

  const showBioNotification = !bio?.date_of_birth || !bio?.gender;

  return (
    <>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Header />
        <h1 className="text-4xl font-bold mx-auto px-12 py-8 lg:px-36 xl:px-72">Body Composition Tracker</h1>
        <BodyCompositionContent
          isAdmin={admin}
          currentUserId={parseInt(session.user.id)}
          userSettings={settings}
          bio={bio}
          initialEntries={entries}
          onSave={saveBodyComposition}
          onFetchEntries={getBodyCompositionEntries}
        />
      </div>
      <Footer />
    </>
  );
}