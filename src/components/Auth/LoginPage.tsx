"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuthState, setUserDetailsState } from "@/store/authSlice";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Spinner from "../Spinner/Spinner";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await setDoc(
          userRef,
          {
            userDetails: {
              email: user.email,
              name: user.displayName,
              profilePic: user.photoURL,
            },
          },
          { merge: true }
        );
      } else {
        await setDoc(userRef, {
          userDetails: {
            email: user.email,
            name: user.displayName,
            profilePic: user.photoURL,
            createdAt: serverTimestamp(),
          },
        });
      }

      dispatch(setAuthState(true));
      dispatch(
        setUserDetailsState({
          uid: user.uid,
          name: user.displayName ?? "",
          email: user.email ?? "",
          profilePic: user.photoURL ?? "",
        })
      );
      // Redirect to home page after login
      router.push("/");
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Section 1: Login */}
      <section className={styles.loginSection}>
        <div className={styles.loginLeft}>
          <h1>Welcome</h1>
          <p>Let's create your account</p>
          <div className={styles.loginButton} onClick={handleAuth}>
            {loading ? (
              <>
                <Spinner />
                <span>Signing in</span>
              </>
            ) : (
              <>
                <Image
                  src="/svgs/Google.svg"
                  alt="Google"
                  width={24}
                  height={24}
                />
                <span>Continue with Google</span>
              </>
            )}
          </div>
        </div>
        <div className={styles.loginRight}>
          <div className={styles.animatedTextBlock}>
            "Experience the power of AI-driven conversations"
          </div>
          <div className={styles.animatedTextBlock}>
            "Seamless integration with multiple AI models"
          </div>
          <div className={styles.animatedTextBlock}>
            "Your personal AI assistant, available 24/7"
          </div>
        </div>
      </section>

      {/* Section 2: Learn More */}
      <section className={styles.learnMoreSection}>
        <h2>Learn More</h2>
        <div className={styles.learnMoreContent}>
          <div className={styles.learnMoreText}>
            <h3>Why Choose Our Platform?</h3>
            <p>
              Our platform leverages advanced AI technology to streamline your
              workflow. With secure authentication and seamless integration, you
              can focus on what matters most.
            </p>
            <p>
              Discover powerful features, an intuitive design, and a user
              experience inspired by leading AI platforms.
            </p>
          </div>
          <div className={styles.loginRight}>
          <div className={styles.animatedTextBlock}>
            "Experience the power of AI-driven conversations"
          </div>
          <div className={styles.animatedTextBlock}>
            "Seamless integration with multiple AI models"
          </div>
          <div className={styles.animatedTextBlock}>
            "Your personal AI assistant, available 24/7"
          </div>
        </div>
        </div>
      </section>

      {/* Section 3: FAQ */}
      <section className={styles.faqSection}>
        <h2>Frequently Asked Questions</h2>
        <div className={styles.faqItem}>
          <h4>How do I sign in with Google?</h4>
          <p>
            Simply click the "Continue with Google" button and follow the
            prompts to securely log in using your Google account.
          </p>
        </div>
        <div className={styles.faqItem}>
          <h4>Is my data secure?</h4>
          <p>
            Yes, we use advanced security measures and Firebase to ensure your
            data is stored securely.
          </p>
        </div>
        <div className={styles.faqItem}>
          <h4>What features does this platform offer?</h4>
          <p>
            Our platform is designed to integrate seamlessly with AI technology,
            offering personalized dashboards, intuitive UIs, and much more.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
