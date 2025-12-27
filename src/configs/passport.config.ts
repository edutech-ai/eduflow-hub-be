import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { User } from '@/models/user.model.js';
import { envConfig } from '@/configs/env.config.js';
import { UserRole, UserStatus } from '@/enums/user.enum.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.googleClientId,
      clientSecret: envConfig.googleClientSecret,
      callbackURL: envConfig.googleCallbackUrl,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        console.log('Google Profile:', profile);

        // Check if user exists with googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('Existing user found:', user.email);
          return done(null, user);
        }

        // Check if user exists with email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            if (!user.avatar && profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            console.log('Linked Google account to existing user:', user.email);
            return done(null, user);
          }
        }

        // Create new user
        const newUser = await User.create({
          name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
          email: email!,
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random password (won't be used)
          googleId: profile.id,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          isEmailVerified: true, // Google already verified email
        });

        console.log('New user created:', newUser.email);
        return done(null, newUser);
      } catch (err) {
        console.error('Error in Google Strategy:', err);
        return done(err as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
