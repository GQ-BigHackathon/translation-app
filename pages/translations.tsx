import { Box, Button, Flex, FlexItem, Form, FormGroup, H4, MultiSelect, Panel, Select, Textarea } from '@bigcommerce/big-design';
import { SwapHorizIcon } from '@bigcommerce/big-design-icons';
import {
  AEFlagIcon,
  CNFlagIcon,
  DEFlagIcon,
  ESFlagIcon,
  FRFlagIcon,
  GBFlagIcon,
  JPFlagIcon,
  PTFlagIcon,
  RUFlagIcon,
} from '@bigcommerce/big-design-icons/flags';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import ErrorMessage from '../components/error';
import Loading from '../components/loading';
import { useStoreInfo } from '../lib/hooks';

const Translations = () => {
  const { isLoading, storeInfo, error } = useStoreInfo();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [exampleWebpage, setExampleWebPage] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('');
  const [savedLanguages, setSavedLanguages] = useState([]);
  const [value, setValue] = useState([]);
  const [leftLanguage, setLeftLanguage] = useState('');
  const [rightLanguage, setRightLanguage] = useState('');
  const [webPageTranslationLanguage, setWebPageTranslationLanguage] = useState('');
  const [textToBeTranslated, setTextToBeTranslated] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const listOfLanguages = [
    { value: 'en-English', content: 'English', disabled: false },
    { value: 'zh-Chinese', content: 'Chinese' },
    { value: 'es-Spanish', content: 'Spanish' },
    { value: 'ar-Arabic', content: 'Arabic' },
    { value: 'de-German', content: 'German' },
    { value: 'pt-Portuguese', content: 'Portuguese' },
    { value: 'ru-Russian', content: 'Russian' },
    { value: 'fr-French', content: 'French' },
    { value: 'ja-Japanese', content: 'Japanese' },
  ];

  const handleChange = (val) => setValue(val);

  const findRelevantFlag = (languageCode) => {
    switch (languageCode) {
      case 'en':
        return <GBFlagIcon />;
      case 'zh':
        return <CNFlagIcon />;
      case 'es':
        return <ESFlagIcon />;
      case 'ar':
        return <AEFlagIcon />;
      case 'de':
        return <DEFlagIcon />;
      case 'pt':
        return <PTFlagIcon />;
      case 'ru':
        return <RUFlagIcon />;
      case 'fr':
        return <FRFlagIcon />;
      case 'ja':
        return <JPFlagIcon />;
    }
  };

  const swapLanguages = () => {
    const newRight = leftLanguage;
    const newLeft = rightLanguage;
    setLeftLanguage(newLeft);
    setRightLanguage(newRight);
  };

  const generateTranslationBody = (text: String, to: String, from = '') => {
    return {
      to,
      from,
      translate: [
        {
          text,
          id: '10',
        },
      ],
    };
  };

  const translateText = async () => {
    const leftLanguageCode = leftLanguage.split('-')[0];
    const rightLanguageCode = rightLanguage.split('-')[0];

    const body = generateTranslationBody(textToBeTranslated, rightLanguageCode, leftLanguageCode);

    const translatedText = await fetch('https://translation-cloud-functions.vercel.app/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => data.translations[0].toText);

    setTranslatedText(translatedText);
  };

  const updateWebPagePreview = async (language) => {
    const languageCode = language.split('-')[0];

    const body = generateTranslationBody(exampleWebpage, languageCode);

    const translatedWebPage = await fetch('https://translation-cloud-functions.vercel.app/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        storehash: storeInfo.id,
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('data', data);
        // data.translations.toText HERE
      });

    const fragment = document.createRange().createContextualFragment(translatedWebPage);
    document.querySelector('.example-box')?.replaceChildren(fragment);
  };

  const fetchStoreLanguages = async (storeHash: string) => {
    return await fetch(`https://translation-cloud-functions.vercel.app/store/languages`, {
      method: 'GET',
      headers: {
        StoreHash: storeHash,
      },
    })
      .then((response) => response.json())
      .catch((error) => console.error(error));
  };

  const fetchPreviewPage = async (url: string) => {
    return fetch(`https://translation-cloud-functions.vercel.app/store/preview`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    }).then((response) => response.text());
  };

  useEffect(() => {
    async function fetchData(storeInfo) {
      const response = await fetchStoreLanguages(storeInfo.id);
      const { defaultLanguage, languagesEnabled } = response;
      setDefaultLanguage(`${defaultLanguage.code}-${defaultLanguage.name[0].toUpperCase() + defaultLanguage.name.slice(1)}`);
      setSavedLanguages(languagesEnabled.map((lang) => `${lang.code}-${lang.name[0].toUpperCase() + lang.name.slice(1)}`));
      setValue(languagesEnabled.map((lang) => `${lang.code}-${lang.name[0].toUpperCase() + lang.name.slice(1)}`));
      const previewPage = await fetchPreviewPage(storeInfo.secure_url);
      setExampleWebPage(previewPage);
      console.log('previewPage', previewPage);
      const fragment = document.createRange().createContextualFragment(previewPage);
      document.querySelector('.example-box')?.appendChild(fragment);
    }
    if (!isLoading) fetchData(storeInfo);
  }, [storeInfo, isLoading]);

  if (isLoading) return <Loading />;

  if (error) return <ErrorMessage error={error} />;

  const saveStoreLanguages = async (storeHash: string, defaultLanguage, savedLanguages) => {
    return fetch(`https://translation-cloud-functions.vercel.app/store/languages`, {
      method: 'POST',
      headers: {
        storehash: storeHash,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ defaultLanguage, languagesEnabled: savedLanguages }),
    })
      .then((response) => response.json())
      .catch((error) => console.error(error));
  };

  const submitLanguageSelection = async () => {
    const body = value.map((lang) => {
      const code = lang.split('-')[0];
      const name = lang.split('-')[1].toLowerCase();

      return { code, name };
    });

    const defaultBody = {
      code: defaultLanguage.split('-')[0],
      name: defaultLanguage.split('-')[1].toLowerCase(),
    };

    const response = await saveStoreLanguages(storeInfo.id, defaultBody, body);
    console.log('response', response);
  };

  return (
    <>
      <Panel header="Translations" id="translations">
        <Flex>
          <FlexItem flexGrow={2}>
            <StyledBox border="box" borderRadius="normal" marginRight="xLarge" padding="medium">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSavedLanguages(value);
                }}
              >
                <FormGroup>
                  <Select
                    filterable={true}
                    label="Default Langauage"
                    maxHeight={300}
                    onOptionChange={(value) => {
                      setDefaultLanguage(value);
                    }}
                    options={[
                      { value: 'en-English', content: 'English' },
                      { value: 'zh-Chinese', content: 'Chinese' },
                      { value: 'es-Spanish', content: 'Spanish' },
                      { value: 'ar-Arabic', content: 'Arabic' },
                      { value: 'de-German', content: 'German' },
                      { value: 'pt-Portuguese', content: 'Portuguese' },
                      { value: 'ru-Russian', content: 'Russian' },
                      { value: 'fr-French', content: 'French' },
                      { value: 'ja-Japanese', content: 'Japanese' },
                    ]}
                    placeholder={'Choose Language'}
                    placement={'bottom-start'}
                    required
                    value={defaultLanguage}
                  />
                </FormGroup>
                <FormGroup>
                  <MultiSelect
                    filterable={true}
                    label="Languages"
                    maxHeight={300}
                    onOptionsChange={handleChange}
                    options={listOfLanguages.map((language) => {
                      if (language.value === defaultLanguage) {
                        language.disabled = true;
                      }

                      return language;
                    })}
                    placeholder={'Choose Language(s)'}
                    placement={'bottom-start'}
                    required
                    value={value}
                  />
                </FormGroup>
                <Box marginTop="xxLarge">
                  <Button type="submit" onClick={submitLanguageSelection}>
                    Save Selection
                  </Button>
                </Box>
              </Form>
            </StyledBox>
          </FlexItem>
          <FlexItem flexGrow={2}>
            <StyledBox border="box" borderRadius="normal" marginRight="xLarge" padding="medium">
              <H4>Selected Languages</H4>
              {[defaultLanguage + ' (Default)', ...savedLanguages].map((language, index) => {
                const languageCode = language.split('-')[0];
                const languageText = language.split('-')[1];
                const flag = findRelevantFlag(languageCode);

                return (
                  <H4 key={index}>
                    {flag} {languageText}
                  </H4>
                );
              })}
            </StyledBox>
          </FlexItem>
        </Flex>
      </Panel>
      <Panel header="Example of Translations" id="example-area">
        <Flex>
          <StyledBox border="box" borderRadius="normal" marginRight="xLarge" padding="medium">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                translateText();
              }}
            >
              <Flex alignItems="center" flexColumnGap="10px" marginBottom="large">
                <FlexItem>
                  <FormGroup>
                    <Select
                      filterable={true}
                      label="From"
                      maxHeight={300}
                      onOptionChange={(value) => setLeftLanguage(value)}
                      options={[defaultLanguage, ...savedLanguages].map((language) => {
                        return { value: language, content: language.split('-')[1] };
                      })}
                      placeholder={'Choose a language'}
                      placement={'bottom-start'}
                      required
                      value={leftLanguage}
                    />
                  </FormGroup>
                </FlexItem>
                <FlexItem paddingTop="large">
                  <SwapHorizIcon onClick={() => swapLanguages()} title="Swap Values" />
                </FlexItem>
                <FlexItem>
                  <FormGroup>
                    <Select
                      filterable={true}
                      label="To"
                      maxHeight={300}
                      onOptionChange={(value) => setRightLanguage(value)}
                      options={[defaultLanguage, ...savedLanguages].map((language) => {
                        return { value: language, content: language.split('-')[1] };
                      })}
                      placeholder={'Choose a language'}
                      placement={'bottom-start'}
                      required
                      value={rightLanguage}
                    />
                  </FormGroup>
                </FlexItem>
              </Flex>
              <Flex>
                <FlexItem flexGrow={2} marginRight="small">
                  <FormGroup>
                    <Textarea
                      onChange={(e) => setTextToBeTranslated(e.target.value)}
                      label="Input"
                      placeholder="Enter some text..."
                      resize={false}
                      required
                      rows={7}
                      value={textToBeTranslated}
                    />
                  </FormGroup>
                </FlexItem>
                <FlexItem flexGrow={2}>
                  <FormGroup>
                    <Textarea label="Output" resize={false} disabled required rows={7} value={translatedText} />
                  </FormGroup>
                </FlexItem>
              </Flex>
              <FlexItem>
                <Box marginTop="xxLarge">
                  <Button type="submit">Translate</Button>
                </Box>
              </FlexItem>
            </Form>
          </StyledBox>
          {storeInfo.status === 'live' && (
            <FlexItem flexGrow={2}>
              <StyledBox border="box" borderRadius="normal" marginRight="xLarge" padding="medium">
                <H4>Webpage Preview</H4>
                <FlexItem>
                  <FormGroup>
                    <Select
                      filterable={true}
                      label="Language"
                      maxHeight={300}
                      onOptionChange={(value) => {
                        setWebPageTranslationLanguage(value);
                        updateWebPagePreview(value);
                      }}
                      options={[defaultLanguage, ...savedLanguages].map((language) => {
                        return { value: language, content: language.split('-')[1] };
                      })}
                      placeholder={'Choose a language'}
                      placement={'bottom-start'}
                      required
                      value={webPageTranslationLanguage}
                    />
                  </FormGroup>
                </FlexItem>
                <Box backgroundColor="secondary10" padding="xxLarge" shadow="floating" className="example-box"></Box>
              </StyledBox>
            </FlexItem>
          )}
        </Flex>
      </Panel>
    </>
  );
};

const StyledBox = styled(Box)`
  min-width: 10rem;
`;

export default Translations;
