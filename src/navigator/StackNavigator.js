import React, { useEffect, useState, useRef } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all your screens
import Splash from '../screens/Splash';
import MyTabs from './BottomNavigator';
import Linkedin from '../screens/Login/Linkedin';
import Login from '../screens/Login/Login';
import Introduction from '../screens/Introduction/Introduction';
import On1 from '../screens/Introduction/On1';
import On2 from '../screens/Introduction/On2';
import On3 from '../screens/Introduction/On3';
import Signup from '../screens/Login/Signup';
import VId from '../screens/Login/VId';
import Otp from '../screens/Login/Otp';
import Phone from '../screens/Login/Phone';
import Email from '../screens/Login/Email';
import Forgot from '../screens/Login/Forgot';
import NewPass from '../screens/Login/NewPass';
import Success from '../screens/Login/Success';
import Profile from '../screens/Account/Profile';
import Notification from '../screens/Home/Notification';
import Chat from '../screens/Message/Chat';
import Apply from '../screens/Apply/Apply';
import Message from '../screens/Message/Message';
import Home from '../screens/Home/Home';
import Search from '../screens/Search/Search';
import SActive from '../screens/Search/SActive';
import JobDetail from '../screens/Home/JobDetail'; // This is the target for your deep link
import CDetail from '../screens/Home/CDetail';
import category from '../screens/Login/Catorgy';
import Location from '../screens/Login/Location';
import IntroMenu from '../screens/Account/Modals/IntroductionMenu';
import BasicDetail from '../screens/Account/Modals/BasicDetail';
import Education from '../screens/Account/Modals/Education';
import ResumeForm from '../screens/Account/Modals/resumeInfoForm';
import ResumeTemp from '../screens/Account/Modals/resumeTemplete';
import ProfileSummary from '../screens/Account/Modals/profileSummary';
import ProfessionalDetail from '../screens/Account/Modals/professionalDetail';
import Employment from '../screens/Account/Modals/employment';
import ProjectDetail from '../screens/Account/Modals/projectDetail';
import PersonalDetail from '../screens/Account/Modals/personalDetails';
import Language from '../screens/Account/Modals/language';
import Career from '../screens/Account/Modals/career';
import SkillMenu from '../screens/Account/Modals/skills';
import CreateResume from '../screens/Account/Modals/createResume';
import SocialLinks from '../screens/Account/Modals/SocialLinks';
import JobList from '../screens/Search/JobList';
import LinkedinVerify from '../screens/Login/LinkedinVerify';
import CVId from '../screens/Login/CVId';
import CompanyBasicDetails from '../screens/Login/CompanySteps/CompanyBasicDetails';
import EmailVerify from '../screens/Login/CompanySteps/emailVerify';
import CompanyDetails from '../screens/Login/CompanySteps/CompanyDetails';
import KycIntro from '../screens/Login/CompanySteps/KycIntro';
import KycComplete from '../screens/Login/CompanySteps/KycComplete';
import KycReview from '../screens/Login/CompanySteps/KycReview';
import VistorProfile from '../screens/Application/VistorProfile';
import ManageApplication from '../screens/Application/MangeAppkicants';
import Validate from '../hooks/vaildator';
import ProfilePerformance from '../screens/Account/Modals/ProfilePerformance';
import AddJob from '../screens/Application/AddJob';
import PlanPage from '../screens/Account/Modals/PlanPage';
import CompanyDetailsModel from '../screens/Account/Modals/CompanyDetail';
import CompanyAboutUs from '../screens/Account/Modals/CompanyAboutUs';
import CompanyContactUs from '../screens/Account/Modals/CompanyContactUS';
import CompanyProfile from '../screens/Account/Modals/CompanyName';
import AddWorkplaceHighlights from '../screens/Account/Modals/allowance';
import recommendedJobsList from '../screens/Search/recommentJobsList';
import ManageJob from '../screens/Application/ManageJob';
import PdfViewer from '../Components/Popups/PdfViewer';
import VideoPlayer from '../Components/Popups/VideoPlayer';
import SettingsScreen from '../Components/Settings/Setting';
import ProfileViewingSettings from '../Components/Settings/Visiblity';
import VisiblityOptions from '../Components/Settings/VisiblityOptions';
import ProfileVisitVisibility from '../Components/Settings/ProfileVisitVisibility';
import DiscoverByEmail from '../Components/Settings/EmaiVisible';
import DiscoverByPhone from '../Components/Settings/PhoneVisible';
import SaveJobList from '../screens/Search/SaveJobList';
import ApplicationTrack from '../screens/Apply/ApplicationTrack';
import InterviewSchedular from '../screens/Application/InterviewSchedular';
import ShorlistedApplicants from '../screens/Application/ShorlistedCandidate';
import Interview from '../screens/Application/Interview';
import JobOfferLetter from '../screens/Application/JobOfferLetter';
import OfferLetterView from '../screens/Apply/OfferLetterView';
import OfferLetter from '../screens/Application/OfferLetter';
import SearchCandiate from '../screens/Search/SearchCandiate';

const Stack = createNativeStackNavigator();

// Create a navigation reference
const navigationRef = createNavigationContainerRef();

const StackNavigator = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [initialJobId, setInitialJobId] = useState(null); // Used for job deep links received before NavigationContainer is ready

  // ✅ CORRECTED linking configuration
  // This tells React Navigation how to map URLs to your screens
  const linking = {
    // These are the URL prefixes your app will respond to
    prefixes: [
      'https://canwinn.abacasys.com', // Your Universal/App Link domain
      'myapp://', // Your custom scheme (e.g., for LinkedIn callback)
    ],
    config: {
      screens: {
        // Map top-level navigators or specific screens if they have direct deep link paths
        MyTabs: 'MyTabs', // e.g., https://canwinn.abacasys.com/MyTabs

        // Map the job deep link path to your JobDetail screen
        // React Navigation automatically parses query parameters like ?job_id=123
        // and makes them available in route.params.job_id
        JobDetail: 'job', // e.g., https://canwinn.abacasys.com/job?job_id=123 will go to JobDetail screen

        // You might also want to map other direct access screens if they have specific deep link paths
        // For instance, if you have a path 'https://canwinn.abacasys.com/login'
        Login: 'login',
        // If LinkedInVerify has a specific deep link (other than your custom scheme)
        LinkedinVerify: 'linkedinverify',
        // Example for a specific ID in path:
        // CDetail: 'company/:id', // e.g. https://canwinn.abacasys.com/company/123 -> CDetail(id=123)
      },
    },
  };

  // ✅ Function to handle the deep link navigation
  const handleDeepLink = (url) => {
    if (!url) return;

    console.log('🔹 Deep link URL received:', url);

    // --- Specific handling for LinkedIn callback (using custom scheme) ---
    // This part requires manual parsing because the `linking` config might not cover complex
    // custom scheme parsing with encoded user data.
    const linkedinMatch = url.match(/myapp:\/\/linkedin\/callback.*user=([^&]*)/);
    if (linkedinMatch && linkedinMatch[1]) {
      const encodedUserData = linkedinMatch[1];
      try {
        const decodedUser = decodeURIComponent(encodedUserData);
        const userData = JSON.parse(decodedUser);
        console.log('✅ Extracted LinkedIn User Data:', userData);

        if (navigationRef.isReady()) {
          navigationRef.navigate('LinkedinVerify', { userData });
        } else {
          // If navigation isn't ready, you might need to store this and navigate later
          // For LinkedIn, often the flow ensures app is ready or re-launched, so this might be less critical.
          console.warn('Navigation not ready for LinkedInVerify.');
          // Or, you could set a state like `setInitialLinkedinData` and have a useEffect for it.
        }
        return; // Stop processing if it's a LinkedIn link
      } catch (e) {
        console.error('Error parsing LinkedIn user data:', e);
        Alert.alert('LinkedIn Error', 'Could not parse user data from link.');
      }
    }

    // --- Job deep link handling (allowing NavigationContainer to do the work) ---
    // For URLs like https://canwinn.abacasys.com/job?job_id=123
    // We let NavigationContainer's `linking` prop handle this automatically.
    // However, if the app is launched and NavigationContainer isn't ready, we need to store it.
    const jobMatch = url.match(/https:\/\/canwinn\.abacasys\.com\/job\?job_id=(\d+)/);
    if (jobMatch && jobMatch[1]) {
      const jobId = jobMatch[1];
      console.log('✅ Extracted Job ID from URL:', jobId);

      if (navigationRef.isReady()) {
        // If navigation is ready, navigate directly
        navigationRef.navigate('JobDetail', { job_id: jobId, fromDeepLink: true });
        // Using job_id here to match the common query parameter name
      } else {
        // If navigation is not ready (e.g., during splash screen), store the job ID
        setInitialJobId(jobId);
      }
      return; // Stop processing if it's a job link
    }

    // --- Fallback/Other links (letting NavigationContainer try) ---
    // For any other deep link that matches the prefixes, let NavigationContainer handle it.
    // If it doesn't match a defined screen in `linking.config`, it might navigate to the initial route.
    console.log('Attempting to let NavigationContainer handle other deep link:', url);
    // You could also add `navigationRef.dispatch(Linking.createNavigationContainerAction(url));`
    // but the `linking` prop usually handles this automatically.
  };

  // Effect to handle navigation for job links received *before* NavigationContainer is ready
  useEffect(() => {
    if (navigationRef.isReady() && initialJobId) {
      console.log('Navigating to JobDetail from initialJobId:', initialJobId);
      navigationRef.navigate('JobDetail', { job_id: initialJobId, fromDeepLink: true });
      setInitialJobId(null); // Clear the ID after navigating
    }
  }, [initialJobId, navigationRef.isReady]);

  useEffect(() => {
    // Hide splash screen after a delay
    setTimeout(() => {
      setShowSplashScreen(false);
    }, 4000); // 4 seconds delay

    // Handle the URL that launched the app
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl); // Call your custom handler
      }
    };
    handleInitialURL(); // Run once on component mount

    // Add event listener for deep links while the app is running
    const deepLinkSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url); // Call your custom handler
    });

    // Clean up the event listener when the component unmounts
    return () => {
      deepLinkSubscription.remove();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    // Pass the linking configuration and navigationRef to NavigationContainer
    <NavigationContainer linking={linking} ref={navigationRef}>
      <Stack.Navigator>
        {/* Splash Screen */}
        {showSplashScreen ? (
          <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
        ) : null}

        {/* Your other Stack Screens (ensure 'JobDetail' is present) */}
        <Stack.Screen
          name="Introduction"
          component={Introduction}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Validate" component={Validate} options={{ headerShown: false }} />
        <Stack.Screen name="MyTabs" component={MyTabs}  options={{ headerShown: false , gestureEnabled: false}} />
        <Stack.Screen name="IntroMenu" component={IntroMenu} options={{ headerShown: false }} />
        <Stack.Screen name="BasicDetail" component={BasicDetail} options={{ headerShown: false }} />
        <Stack.Screen name="Education" component={Education} options={{ headerShown: false }} />
        <Stack.Screen name="CDetail" component={CDetail} options={{ headerShown: false }} />
        <Stack.Screen name="JobDetail" component={JobDetail} options={{ headerShown: false }} />
        <Stack.Screen name="SActive" component={SActive} options={{ headerShown: false }} />
        <Stack.Screen name="Search" component={Search} options={{ headerShown: false }} />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="Message" component={Message} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        <Stack.Screen name="Apply" component={Apply} options={{ headerShown: false }} />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="recommendedJobsList"
          component={recommendedJobsList}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AddJob" component={AddJob} options={{ headerShown: false }} />
        <Stack.Screen name="PlanPage" component={PlanPage} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="Success" component={Success} options={{ headerShown: false }} />
        <Stack.Screen name="NewPass" component={NewPass} options={{ headerShown: false }} />
        <Stack.Screen name="Forgot" component={Forgot} options={{ headerShown: false }} />
        <Stack.Screen name="Email" component={Email} options={{ headerShown: false }} />
        <Stack.Screen name="VId" component={VId} options={{ headerShown: false }} />
        <Stack.Screen name="CVId" component={CVId} options={{ headerShown: false }} />
        <Stack.Screen
          name="ComBasicDetail"
          component={CompanyBasicDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="EmailVerify" component={EmailVerify} options={{ headerShown: false }} />
        <Stack.Screen
          name="ComDetail"
          component={CompanyDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="KycIntro" component={KycIntro} options={{ headerShown: false }} />
        <Stack.Screen name="KycComplete" component={KycComplete} options={{ headerShown: false }} />
        <Stack.Screen name="KycReview" component={KycReview} options={{ headerShown: false }} />
        <Stack.Screen name="Category" component={category} options={{ headerShown: false }} />
        <Stack.Screen name="Location" component={Location} options={{ headerShown: false }} />
        <Stack.Screen name="Otp" component={Otp} options={{ headerShown: false }} />
        <Stack.Screen name="Phone" component={Phone} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="On3" component={On3} options={{ headerShown: false }} />
        <Stack.Screen name="On2" component={On2} options={{ headerShown: false }} />
        <Stack.Screen name="Linkedin" component={Linkedin} options={{ headerShown: false }} />
        <Stack.Screen name="On1" component={On1} options={{ headerShown: false }} />
        <Stack.Screen name="Resume Templete" component={ResumeTemp} />
        <Stack.Screen name="SaveJob" component={SaveJobList} options={{ headerShown: false }} />
        <Stack.Screen
          name="VistorProfile"
          component={VistorProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManageApplication"
          component={ManageApplication}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileSummary"
          component={ProfileSummary}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfessionalDetail"
          component={ProfessionalDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Employment" component={Employment} options={{ headerShown: false }} />
        <Stack.Screen
          name="ProjectDetail"
          component={ProjectDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PersonalDetails"
          component={PersonalDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfilePerformance"
          component={ProfilePerformance}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Manage Job Listing"
          component={ManageJob}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Language" component={Language} options={{ headerShown: false }} />
        <Stack.Screen name="Career" component={Career} options={{ headerShown: false }} />
        <Stack.Screen name="Skills" component={SkillMenu} options={{ headerShown: false }} />
        <Stack.Screen name="SocialLinks" component={SocialLinks} options={{ headerShown: false }} />
        <Stack.Screen name="Resume Form" component={ResumeForm} options={{ headerShown: true }} />
        <Stack.Screen name="Job List" component={JobList} options={{ headerShown: false }} />
        <Stack.Screen
          name="CreateResume"
          component={CreateResume}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LinkedinVerify"
          component={LinkedinVerify}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompanyDetailModel"
          component={CompanyDetailsModel}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompanyAboutUs"
          component={CompanyAboutUs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompanyContactUs"
          component={CompanyContactUs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompanyName"
          component={CompanyProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="PdfViewer" component={PdfViewer} options={{ headerShown: false }} />
        <Stack.Screen name="VideoViewer" component={VideoPlayer} options={{ headerShown: false }} />
        <Stack.Screen name="setting" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Allowance"
          component={AddWorkplaceHighlights}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VisiblityOptions"
          component={VisiblityOptions}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileVisitVisibility"
          component={ProfileVisitVisibility}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Visiblity"
          component={ProfileViewingSettings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DiscoverByEmail"
          component={DiscoverByEmail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DiscoverByPhone"
          component={DiscoverByPhone}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ApplicationTrack"
          component={ApplicationTrack}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InterviewSchedular"
          component={InterviewSchedular}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShortlistedApplicants"
          component={ShorlistedApplicants}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Interview" component={Interview} options={{ headerShown: false }} />
        <Stack.Screen
          name="JobOfferLetter"
          component={JobOfferLetter}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OfferLetterView"
          component={OfferLetterView}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="OfferLetter" component={OfferLetter} options={{ headerShown: false }} />
        <Stack.Screen
          name="SearchCandiate"
          component={SearchCandiate}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
