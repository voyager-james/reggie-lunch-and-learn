export type FormField = {
  name: 'fullName' | 'email' | 'phone' | 'businessName';
  label: string;
  type: 'text' | 'email' | 'tel';
  required: boolean;
  autocomplete?: string;
};

export const webinar = {
  title: 'Lunch and Learn: 30-Day Business Owner Mastery',
  date: 'August 20th, 2026',
  timeEastern: '11:45 am - 1:15 pm',
  startsAtIso: '2026-08-20T11:45:00-04:00',
  venue: 'Landfall Country Club',
  locationLabel: 'Wilmington, NC',
  thankYouPath: '/lunch-and-learn-strategy-thank-you',
  ghlTag: 'reggie-lunch-and-learn',
  heroVideoPoster: '/images/reggie/boardroom.jpg',
  heroCoachImage: '/images/reggie/hero-stage.png',
  coachPortraitImage: '/images/reggie/reggie-headshot.png',
  masteryPosterImage: '/images/reggie/mastery-poster.png',
  logoImage: '/images/reggie/actioncoach-logo.png',
  business: {
    name: '30-Day Business Owner Mastery',
    tagline: 'The next level of business requires the next level of owner.',
    footer: '(c) 2026 Reggie Shropshire | ActionCOACH | Wilmington, NC',
  },
  form: {
    fields: [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        required: true,
        autocomplete: 'name',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        autocomplete: 'email',
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        required: true,
        autocomplete: 'tel',
      },
      {
        name: 'businessName',
        label: 'Business Name',
        type: 'text',
        required: true,
        autocomplete: 'organization',
      },
    ] as FormField[],
  },
} as const;

export type RegistrationPayload = {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
};
