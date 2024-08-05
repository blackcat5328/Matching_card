window.initGame = (React, assetsUrl) => {
  const { useState, useEffect, useRef, Suspense, useMemo } = React;
  const { useFrame, useLoader, useThree } = window.ReactThreeFiber;
  const THREE = window.THREE;
  const { GLTFLoader } = window.THREE;

  const CardModel = React.memo(function CardModel({ url, scale = [1, 1, 1], position = [0, 0, 0] }) {
    const gltf = useLoader(GLTFLoader, url);
    const copiedScene = useMemo(() => gltf.scene.clone(), [gltf]);
    
    useEffect(() => {
      copiedScene.scale.set(...scale);
      copiedScene.position.set(...position);
    }, [copiedScene, scale, position]);

    return React.createElement('primitive', { object: copiedScene });
  });

  function Card({ position, isActive, onFlip }) {
    const cardRef = useRef();
    const [cardY, setCardY] = useState(-1);

    useFrame((state, delta) => {
      if (cardRef.current) {
        const targetY = isActive ? 0 : -1;
        setCardY(current => THREE.MathUtils.lerp(current, targetY, delta * 5));
        cardRef.current.position.y = cardY;
      }
    });

    return React.createElement(
      'group',
      { 
        ref: cardRef,
        position: position,
        onClick: onFlip
      },
      React.createElement(CardModel, { 
        url: `${assetsUrl}/card.glb`,
        scale: [3, 3, 3],
        position: [0, -0.5, 0]
      })
    );
  }

  function MatchingCardGame() {
    const [cards, setCards] = useState(Array(18).fill(false));
    const [flippedCards, setFlippedCards] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
      // Shuffle the cards
      const shuffledCards = Array(18)
        .fill()
        .map((_, i) => i % 9)
        .sort(() => Math.random() - 0.5);

      setCards(shuffledCards.map(index => index));
    }, []);

    const flipCard = (index) => {
      if (!cards[index]) {
        setCards(prevCards => {
          const newCards = [...prevCards];
          newCards[index] = true;
          return newCards;
        });
        setFlippedCards(prevFlippedCards => [...prevFlippedCards, index]);

        if (flippedCards.length === 1 && cards[flippedCards[0]] === index) {
          // Match found
          setScore(prevScore => prevScore + 1);
          setFlippedCards([]);
        } else if (flippedCards.length === 2) {
          // No match, flip back the cards
          setTimeout(() => {
            setCards(prevCards => {
              const newCards = [...prevCards];
              newCards[flippedCards[0]] = false;
              newCards[flippedCards[1]] = false;
              return newCards;
            });
            setFlippedCards([]);
          }, 1000);
        }
      }
    };

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Camera),
      React.createElement('ambientLight', { intensity: 0.5 }),
      React.createElement('pointLight', { position: [10, 10, 10] }),
      cards.map((isActive, index) => 
        React.createElement(Card, {
          key: index,
          position: [
            (index % 6 - 2.5) * 4,
            0,
            (Math.floor(index / 6) - 1.5) * 4
          ],
          isActive: isActive,
          onFlip: () => flipCard(index)
        })
      )
    );
  }

  function Camera() {
    const { camera } = useThree();
    
    useEffect(() => {
      camera.position.set(0, 10, 15);
      camera.lookAt(0, 0, 0);
    }, [camera]);

    return null;
  }

  return MatchingCardGame;
};

console.log('Matching Card game script loaded');
