import React from 'react';
import CardList from './cards/Cards';
import BorderedBoxWithLabel from './borderedBox';

const Home = () => {
  return (
    <div>
      <CardList />
      <div>
        <BorderedBoxWithLabel label="Example Box">
          {/* Content inside the box */}
          <p>This is the content of the box.</p>
        </BorderedBoxWithLabel>
      </div>
    </div>
  );
};

export default Home;
