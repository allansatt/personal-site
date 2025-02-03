import React from 'react';
import { FAVICON_BY_NAME } from 'features/socials/utils';
import 'LandingPage.css';
import { useSocialsRequest } from 'features/socials/hooks/api';
const LandingPage: React.FC = () => {
    const {data: socials, error} = useSocialsRequest();
    return (
      <div className="landing-page">
        <h1>Allan Sattelberg Rivera</h1>
        <div className="social-links">
          { error ? <div>{error.message}</div> :
            (socials ? Object.entries(socials).map(([key, value]) => {
              return <a href={value}>
                {FAVICON_BY_NAME[key as keyof typeof FAVICON_BY_NAME]({})}
              </a>
            }) : null)
          }
        </div>
      </div>
    );
  };

export default LandingPage