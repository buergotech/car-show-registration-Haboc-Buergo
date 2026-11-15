
import { useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Bell,
  Settings,
  Save,
  CheckCircle2,
  UserCog,
} from "lucide-react";

interface Profile {
  name: string;
  email: string;
  phone: string;
}

interface NotificationSettings {
  registrations: boolean;
  payments: boolean;
  checkIns: boolean;
}

interface DashboardPreferences {
  emailNotifications: boolean;
  compactView: boolean;
}

interface UserSettings {
  profile: Profile;
  notifications: NotificationSettings;
  preferences: DashboardPreferences;
}

const STORAGE_KEY = "carshow2027_settings";

const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    name: "Event Administrator",
    email: "admin@carshow2027.com",
    phone: "",
  },
  notifications: {
    registrations: true,
    payments: true,
    checkIns: true,
  },
  preferences: {
    emailNotifications: true,
    compactView: false,
  },
};

const loadSettings = (): UserSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(saved);

    return {
      profile: {
        name:
          typeof parsed.profile?.name === "string"
            ? parsed.profile.name
            : DEFAULT_SETTINGS.profile.name,
        email:
          typeof parsed.profile?.email === "string"
            ? parsed.profile.email
            : DEFAULT_SETTINGS.profile.email,
        phone:
          typeof parsed.profile?.phone === "string"
            ? parsed.profile.phone
            : DEFAULT_SETTINGS.profile.phone,
      },
      notifications: {
        registrations:
          typeof parsed.notifications?.registrations === "boolean"
            ? parsed.notifications.registrations
            : DEFAULT_SETTINGS.notifications.registrations,
        payments:
          typeof parsed.notifications?.payments === "boolean"
            ? parsed.notifications.payments
            : DEFAULT_SETTINGS.notifications.payments,
        checkIns:
          typeof parsed.notifications?.checkIns === "boolean"
            ? parsed.notifications.checkIns
            : DEFAULT_SETTINGS.notifications.checkIns,
      },
      preferences: {
        emailNotifications:
          typeof parsed.preferences?.emailNotifications === "boolean"
            ? parsed.preferences.emailNotifications
            : DEFAULT_SETTINGS.preferences.emailNotifications,
        compactView:
          typeof parsed.preferences?.compactView === "boolean"
            ? parsed.preferences.compactView
            : DEFAULT_SETTINGS.preferences.compactView,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export default function UserProfileSettings() {
  const [initialSettings] = useState<UserSettings>(() => loadSettings());

  const [profile, setProfile] = useState<Profile>(
    initialSettings.profile
  );

  const [savedProfile, setSavedProfile] = useState<Profile>(
    initialSettings.profile
  );

  const [notifications, setNotifications] =
    useState<NotificationSettings>(initialSettings.notifications);

  const [savedNotifications, setSavedNotifications] =
    useState<NotificationSettings>(initialSettings.notifications);

  const [preferences, setPreferences] =
    useState<DashboardPreferences>(initialSettings.preferences);

  const [savedPreferences, setSavedPreferences] =
    useState<DashboardPreferences>(initialSettings.preferences);

  const [showSuccess, setShowSuccess] = useState(false);

  const updateProfile = (
    field: keyof Profile,
    value: string
  ) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    setShowSuccess(false);
  };

  const handleSave = () => {
    const settingsToSave: UserSettings = {
      profile,
      notifications,
      preferences,
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settingsToSave)
      );

      setSavedProfile({ ...profile });
      setSavedNotifications({ ...notifications });
      setSavedPreferences({ ...preferences });

      setShowSuccess(true);

      window.setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save user settings:", error);
    }
  };

  const isChanged =
    profile.name !== savedProfile.name ||
    profile.email !== savedProfile.email ||
    profile.phone !== savedProfile.phone ||
    notifications.registrations !== savedNotifications.registrations ||
    notifications.payments !== savedNotifications.payments ||
    notifications.checkIns !== savedNotifications.checkIns ||
    preferences.emailNotifications !== savedPreferences.emailNotifications ||
    preferences.compactView !== savedPreferences.compactView;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-700 bg-[#10243D] shadow-xl">
      <div className="flex flex-col gap-3 border-b border-slate-700 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2.5">
            <UserCog className="text-blue-400" size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              User Profile & Settings
            </h2>
            <p className="text-xs text-slate-400">
              Manage your administrator profile and dashboard preferences
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
          <ShieldCheck size={13} className="mr-1 inline" />
          Administrator
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <UserRound size={18} className="text-blue-400" />
            <h3 className="font-semibold text-white">
              Profile Information
            </h3>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-[#071426] p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600/20">
              <UserRound size={28} className="text-blue-400" />
            </div>

            <div className="min-w-0">
              <p className="truncate font-bold text-white">
                {profile.name || "Your Name"}
              </p>
              <p className="text-xs text-slate-400">
                Event Administrator
              </p>
              <p className="mt-1 truncate text-xs text-blue-400">
                Car Show 2027
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) =>
                    updateProfile("name", event.target.value)
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    updateProfile("email", event.target.value)
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-300">
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(event) =>
                    updateProfile("phone", event.target.value)
                  }
                  placeholder="Enter your phone number"
                  className="w-full rounded-lg border border-slate-600 bg-[#071426] py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!isChanged}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={16} />
            Save Profile & Settings
          </button>

          {showSuccess && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400"
            >
              <CheckCircle2 size={17} />
              Profile and settings saved successfully!
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Bell size={18} className="text-blue-400" />
              <h3 className="font-semibold text-white">
                Notification Preferences
              </h3>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-700 bg-[#071426] p-4">
              <SettingToggle
                title="Registration Updates"
                description="Receive updates about new registrations."
                checked={notifications.registrations}
                onChange={(checked) => {
                  setNotifications((previous) => ({
                    ...previous,
                    registrations: checked,
                  }));
                  setShowSuccess(false);
                }}
              />

              <div className="border-t border-slate-700" />

              <SettingToggle
                title="Payment Updates"
                description="Receive notifications about recorded payments."
                checked={notifications.payments}
                onChange={(checked) => {
                  setNotifications((previous) => ({
                    ...previous,
                    payments: checked,
                  }));
                  setShowSuccess(false);
                }}
              />

              <div className="border-t border-slate-700" />

              <SettingToggle
                title="Check-in Updates"
                description="Receive participant attendance updates."
                checked={notifications.checkIns}
                onChange={(checked) => {
                  setNotifications((previous) => ({
                    ...previous,
                    checkIns: checked,
                  }));
                  setShowSuccess(false);
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Settings size={18} className="text-blue-400" />
              <h3 className="font-semibold text-white">
                Dashboard Preferences
              </h3>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-700 bg-[#071426] p-4">
              <SettingToggle
                title="Email Notifications"
                description="Enable email notification preference."
                checked={preferences.emailNotifications}
                onChange={(checked) => {
                  setPreferences((previous) => ({
                    ...previous,
                    emailNotifications: checked,
                  }));
                  setShowSuccess(false);
                }}
              />

              <div className="border-t border-slate-700" />

              <SettingToggle
                title="Compact View"
                description="Enable a more compact dashboard layout preference."
                checked={preferences.compactView}
                onChange={(checked) => {
                  setPreferences((previous) => ({
                    ...previous,
                    compactView: checked,
                  }));
                  setShowSuccess(false);
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-white">
                Account Overview
              </h3>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Account Role</span>
                <span className="font-medium text-white">
                  Administrator
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-400">System</span>
                <span className="font-medium text-white">
                  Car Show 2027
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Account Status</span>
                <span className="font-medium text-green-400">
                  Active (Demo)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">
          {title}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
