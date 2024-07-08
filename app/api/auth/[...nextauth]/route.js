import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDB } from '@utils/databse';
import User from '@models/user';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        await connectToDB();
        console.log('Fetching user for session:', session.user.email);
        const sessionUser = await User.findOne({ email: session.user.email });

        if (sessionUser) {
          session.user.id = sessionUser._id.toString();
          console.log('Session user found:', sessionUser.email);
        } else {
          console.log('No user found for this session');
        }

        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },
    async signIn({ profile }) {
      try {
        await connectToDB();
        console.log('Checking if user exists:', profile.email);
        let userExists = await User.findOne({ email: profile.email });

        if (!userExists) {
          let username = profile.name.replace(/\s/g, '').toLowerCase();

          // Ensure the username is between 3 and 20 alphanumeric characters
          if (username.length < 3) {
            username = username.padEnd(8, '0'); // Pad with '0' if too short
          }
          if (username.length > 20) {
            username = username.slice(0, 20); // Trim if too long
          }

          // Ensure username uniqueness
          let uniqueUsername = username;
          let usernameExists = await User.findOne({ username: uniqueUsername });
          let suffix = 1;
          while (usernameExists) {
            uniqueUsername = `${username.slice(0, 15)}${suffix}`; // Adjust length to account for suffix
            usernameExists = await User.findOne({ username: uniqueUsername });
            suffix++;
          }

          console.log('Creating new user:', profile.email, uniqueUsername);
          const newUser = await User.create({
            email: profile.email,
            username: uniqueUsername,
            image: profile.picture,
          });
          console.log('New user created:', newUser.email);
        } else {
          console.log('User already exists:', userExists.email);
        }

        return true;
      } catch (error) {
        console.error('Error during signIn callback:', error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
