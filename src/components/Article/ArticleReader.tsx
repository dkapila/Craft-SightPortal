import React, {
  useEffect, useState, useCallback,
} from 'react';
import { ApiResponse, CraftBlock, CraftImageBlockInsert } from '@craftdocs/craft-extension-api';
import TurnDownService from 'turndown';
import styled from 'styled-components';
import 'react-spring-bottom-sheet/dist/style.css';
import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import usePortalStore from '../../store/store';
import { PortalMainStore, PortalResultBlock, PortalTextResult } from '../../Types';
import CraftAPIHelper from '../../api/craftAPIHelper';
import Switch from '../Switch/Switch';
import { insertNewBlock, navigateToBlock } from '../../utils/block';
import getHtmlFromUrl from '../../utils/request';
import withOpacity from '../../utils/colors';
import getBlocksInCurrentPage from '../../search/blockSearch';
import Constants from '../../utils/constants';
import { getArticleReadingTime } from '../../utils/time';

interface ArticleContentProps {
  $onlyShowHighlights: boolean,
  $useComfortMode: boolean,
}

const ReaderContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0px;
    padding-bottom: 10px;
`;

const LoadingArticleContainer = styled(ReaderContainer)`
  padding: 0px 10px 10px 10px;
`;

const StyledReaderContentContainer = styled.div<ArticleContentProps>`
  padding-top: 10px;
  max-width: 100%;
  color: ${(props) => props.theme.primaryTextColor};

  dd {
    margin-inline-start: 0px;
    margin-inline-end: 0px;
  }

  blockquote {
    margin-inline-start: 10px;
    margin-inline-end: 10px;
    font-style: italic;
    padding: 2px;
    opacity: 0.75;
  }

  ul, ol {
    padding-inline-start: 25px;
  }

  figure {
    margin-inline-start: 0;
    margin-inline-end: 0;
  }

  video {
    max-width: 220px;
    max-height: 220px;
    display: block;
  }

  [data-craft-block-id] {
    transition: background 300ms ease-in;
    background: ${(props) => withOpacity(props.theme.accentColor, 10)};
  }

  img {
    cursor: pointer;
    display: block;
    max-width: 100%;
    max-height: 220px;
    object-fit: cover;
    margin: 0 auto;
  }

  th, td, div {
    color: ${(props) => props.theme.primaryTextColor};
    font-size: ${(props) => (props.$useComfortMode ? '15px' : '13px')};
  }

  span {
    color: ${(props) => props.theme.primaryTextColor};
    padding: 2px;
    font-size: ${(props) => (props.$useComfortMode ? '15px' : '13px')};
  }

  p, li, h1, h2, h3, h4, h5, h6, blockquote { 
    padding: 2px;
    cursor: pointer;
    margin-block-end: 0px;
    margin-block-start: 0px;
  }

  p {
    margin-block-end: ${(props) => (props.$useComfortMode ? '6px' : '4px')};
    margin-block-start: ${(props) => (props.$useComfortMode ? '6px' : '4px')};
    line-height ${(props) => (props.$useComfortMode ? '1.4em' : '1.3em')};
  }

  a { 
    color: ${(props) => props.theme.linkTextColor};
  }

  h1 {
    font-size: ${(props) => (props.$useComfortMode ? '17px' : '15px')};
  }
  h2 {
    font-size: ${(props) => (props.$useComfortMode ? '17px' : '15px')};
  }
  h3 {
    font-size: ${(props) => (props.$useComfortMode ? '16px' : '14px')};
  }
  h4 {
    font-size: ${(props) => (props.$useComfortMode ? '16px' : '14px')};
  }
  h3 {
    font-size: ${(props) => (props.$useComfortMode ? '15px' : '13px')};
  }
  h2 {
    font-size: ${(props) => (props.$useComfortMode ? '15px' : '13px')};
  }
  h1 {
    font-size: ${(props) => (props.$useComfortMode ? '15px' : '13px')};
  }

  p:empty, div:empty, h1:empty, h2:empty, h3:empty, h4:empty, h5:empty, h6:empty,
  li:empty, dd:empty, blockquote: empty, span:empty, ul:empty, ol:empty,
  figure:empty, video:empty, image:empty {
    display: none;
  }
`;

const StyledReadingTime = styled.div<ArticleContentProps>`
  text-align: center;
  padding-top: 10px;
  opacity: 0.5;
  display: ${(props) => (props.$onlyShowHighlights ? 'none' : 'block')};
`;

const StyledSiteTitleContainer = styled.div<ArticleContentProps>`
  max-width: 100%;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: ${(props) => (props.$useComfortMode ? '15px' : '13px')};
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => props.theme.primaryTextColor};
`;

const StyledArticleContent = styled.div<ArticleContentProps>`
  font-size: ${(props) => (props.$useComfortMode ? '15px' : '13px')};
  padding-left: 5px;
  padding-right: 5px;
  user-select: text;

  ${({ $onlyShowHighlights }) => $onlyShowHighlights && `
    p:not([data-craft-block-id]), 
    h1:not([data-craft-block-id]),
    h2:not([data-craft-block-id]),  
    h3:not([data-craft-block-id]),
    h4:not([data-craft-block-id]),
    h5:not([data-craft-block-id]),
    h6:not([data-craft-block-id]),
    li:not([data-craft-block-id]),
    blockquote:not([data-craft-block-id]),
    code, pre, figure, table, video, img, dd, figcaption {
      display: none;
    }
  `}
`;

const StyledArticleExceprt = styled.div<ArticleContentProps>`
  padding-top: 10px;
  font-style: italic;
  opacity: 0.5;
  font-size: ${(props) => (props.$useComfortMode ? '13px' : '12px')};
  padding-left: 5px;
  padding-right: 5px;
  user-select: text;
  display: ${(props) => (props.$onlyShowHighlights ? 'none' : 'block')};
`;

const StyledUrlLink = styled.a`
    color: ${(props) => props.theme.accentColor};
`;

const StyledArticleAuthor = styled.div<ArticleContentProps>`
  font-style: italic;
  text-align: center;
  opacity: 0.5;
  font-size: ${(props) => (props.$useComfortMode ? '14px' : '12px')};
  padding-left: 5px;
  padding-right: 5px;
  user-select: text;
  display: ${(props) => (props.$onlyShowHighlights ? 'none' : 'block')};
`;

const StyledHiglightsHelpText = styled.div`
    font-style: italic!important;
    text-align: center!important;
    font-size: 11px!important;
    color: ${(props) => withOpacity(props.theme.primaryTextColor, 60)}!important;
`;

const StyledSwitchContainer = styled.div`
  width: 100%;
`;

const StyledArticleEnd = styled.hr`
  margin: 24px 0;
  border: 0;
  text-align: center;
  
  &:before {
    content: '\\2022 \\2022 \\2022';
    color: ${(props) => props.theme.accentColor};
    font-size: 25px;
  }
`;

const ArticleReader = () => {
  const article = usePortalStore((state: PortalMainStore) => state.article);
  const setArticleLoading = usePortalStore((state: PortalMainStore) => state.setArticleLoading);
  const setArticle = usePortalStore((state: PortalMainStore) => state.setArticle);
  const parsedArticle = usePortalStore((state: PortalMainStore) => state.parsedArticle);
  const [articleHtml, setArticleHtml] = useState<string>('');
  const setParsedArticle = usePortalStore((state: PortalMainStore) => state.setParsedArticle);
  const [onlyShowHighlights, setOnlyShowHighlights] = useState(false);
  const [articleUrl, setArticleUrl] = useState('');

  const responseContainsDeletedBlockIds = (
    response: ApiResponse<CraftBlock[]>,
  ) => (Array.isArray(response.data) && response.data.length > 0);

  const onResponseReceived = useCallback(async (
    response: ApiResponse<CraftBlock[]>,
    target: HTMLElement | null,
  ) => {
    if (response.status === 'success' && target) {
      if (responseContainsDeletedBlockIds(response)) {
        target.removeAttribute(Constants.HIGHLIGHTED_BLOCK_IN_READER_DATA_ATTRIBUTE);
      }

      if (response.data[0].type === 'imageBlock') {
        CraftAPIHelper.navigateToBlockId(response.data[0].id);
      }
      if (response.data[0].type === 'textBlock') {
        const { id } = response.data[0];
        const { spaceId } = response.data[0];
        await CraftAPIHelper.selectedBlocks([id]);
        if (id && spaceId) {
          navigateToBlock(id, spaceId);
          target.setAttribute(Constants.HIGHLIGHTED_BLOCK_IN_READER_DATA_ATTRIBUTE, id);
        }
      }
    }
  }, []);

  const onOpenLink = useCallback((event) => {
    if (article.activeUrl) {
      CraftAPIHelper.openUrl(article.activeUrl);
    }

    event.preventDefault();
  }, [article]);

  const onArticleContentClicked = (async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const selectedText = window.getSelection();
    if (selectedText && selectedText.toString().length > 0) {
      return;
    }

    let target = (e.target as HTMLElement | null);

    const validTextTags = ['LI', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    const promises: any[] = [];
    let selectedTarget: HTMLElement | null = null;

    while ((target as HTMLElement).parentElement) {
      if (target && 'tagName' in target) {
        const { tagName } = target as HTMLAnchorElement;
        if (tagName === 'A' && (target as HTMLAnchorElement).href) {
          CraftAPIHelper.openUrl((target as HTMLAnchorElement).href);
          e.preventDefault();
          break;
        }

        if (tagName === 'IMG') {
          const block: CraftImageBlockInsert = {
            type: 'imageBlock',
            url: (target as HTMLImageElement).src,
          };

          selectedTarget = target;
          promises.push(insertNewBlock([block]));
          e.preventDefault();
          break;
        }

        if (validTextTags.includes(tagName)) {
          const turndownService = new TurnDownService();
          let markdownText = turndownService.turndown(target.outerHTML);
          if (e.metaKey) {
            markdownText = `> ${markdownText}`;
          }

          selectedTarget = target;

          const blockId = selectedTarget.getAttribute(
            Constants.HIGHLIGHTED_BLOCK_IN_READER_DATA_ATTRIBUTE,
          );
          if (!blockId) {
            const craftBlocks = CraftAPIHelper.markdownToCraftBlock(markdownText);
            promises.push(insertNewBlock(craftBlocks));
          } else {
            promises.push(CraftAPIHelper.deleteBlock([blockId]));
          }
          e.preventDefault();
          break;
        }
      }

      if ((target as HTMLElement).parentElement !== null) {
        target = (target as HTMLElement).parentElement;
      }
    }

    const responses = await Promise.all(promises);
    if (responses.length > 0) {
      onResponseReceived(responses[0], selectedTarget);
    }
  });

  useEffect(() => {
    const createNewArticle = async (blocksMap: { [id: string]: string }) => {
      setArticleLoading(true);

      if (article.activeUrl) {
        let html = await getHtmlFromUrl(article.activeUrl);

        setArticleLoading(false);
        setParsedArticle(null);
        setArticleHtml('');

        if (!html) {
          return;
        }

        html = html.trim();

        if (!html.startsWith(Constants.DOCTYPE)
          && !html.startsWith(Constants.DOCTYPE.toLowerCase())) {
          return;
        }

        const articleDoc = new DOMParser().parseFromString(html, 'text/html');
        const base = articleDoc.createElement('base');
        base.href = new URL(article.activeUrl).origin;
        articleDoc.head.appendChild(base);

        const textNodes = ([] as Element[])
          .concat(Array.from(articleDoc.getElementsByTagName('p')))
          .concat(Array.from(articleDoc.getElementsByTagName('h1')))
          .concat(Array.from(articleDoc.getElementsByTagName('h2')))
          .concat(Array.from(articleDoc.getElementsByTagName('h3')))
          .concat(Array.from(articleDoc.getElementsByTagName('h4')))
          .concat(Array.from(articleDoc.getElementsByTagName('h5')))
          .concat(Array.from(articleDoc.getElementsByTagName('h6')))
          .concat(Array.from(articleDoc.getElementsByTagName('li')));

        textNodes.forEach((node) => {
          if (!node.textContent) {
            return;
          }

          const nodeContent = node.textContent.trim();

          if (nodeContent in blocksMap) {
            node.setAttribute(
              Constants.HIGHLIGHTED_BLOCK_IN_READER_DATA_ATTRIBUTE,
              blocksMap[nodeContent],
            );
          }
        });

        if (!Array.from(articleDoc.body.childNodes).some((node) => node.nodeType === 1)) {
          setParsedArticle(null);
          return;
        }

        const reader = new Readability(articleDoc);
        const parsed = reader.parse();
        if (!parsed) {
          return;
        }

        setParsedArticle(parsed);
      }
    };

    const onNewArticle = async () => {
      const blocksMap: { [id: string]: string } = {};
      const blocksInPage: PortalResultBlock[] = (await getBlocksInCurrentPage(new CraftAPIHelper()))
        .blocks
        .filter((block) => block.type === 'PortalTextResult');

      blocksInPage.forEach((block) => {
        const { fullString } = block as PortalTextResult;
        if (fullString) {
          blocksMap[fullString] = block.blockId;
        }
      });

      createNewArticle(blocksMap);
      return blocksInPage;
    };

    if (article.activeUrl) {
      if (article.activeUrl === articleUrl) {
        return;
      }

      setArticleUrl(article.activeUrl);
      onNewArticle();
    }
  }, [article]);

  useEffect(() => {
    if (!parsedArticle) {
      return;
    }

    const markup = DOMPurify.sanitize(parsedArticle.content);
    setArticleHtml(markup);
  }, [parsedArticle]);

  return (
    <div>
      {
        (!parsedArticle) && (
        <LoadingArticleContainer
          onClick={(e) => onArticleContentClicked(e)}
          className={Constants.ARTICLE_SHEEET_CLAS_NAME}
        >
          <StyledSiteTitleContainer
            $useComfortMode={article.articleComfortMode ? article.articleComfortMode : false}
            $onlyShowHighlights={onlyShowHighlights}
          >
            Selected Url:
            <StyledUrlLink href={article.activeUrl} onClick={(e) => onOpenLink(e)}>
              {' '}
              { article.activeUrl }
            </StyledUrlLink>
          </StyledSiteTitleContainer>
        </LoadingArticleContainer>
        )
      }
      {
      (parsedArticle) && (
        <ReaderContainer
          onClick={(e) => onArticleContentClicked(e)}
          className={Constants.ARTICLE_SHEEET_CLAS_NAME}
        >
          <StyledSwitchContainer>
            <Switch
              enabled={article.articleComfortMode ? article.articleComfortMode : false}
              onToggled={(isEnabled) => {
                setArticle({
                  ...article, articleComfortMode: isEnabled,
                });
              }}
              label="Comfort Mode"
            />
          </StyledSwitchContainer>
          <StyledSwitchContainer>
            <Switch
              enabled={onlyShowHighlights}
              onToggled={(isEnabled) => { setOnlyShowHighlights(isEnabled); }}
              label="View Highlights"
            />
          </StyledSwitchContainer>
          <StyledReaderContentContainer
            $useComfortMode={article.articleComfortMode ? article.articleComfortMode : false}
            $onlyShowHighlights={onlyShowHighlights}
          >
            {
            (parsedArticle?.byline) && (
            <StyledArticleAuthor
              $useComfortMode={article.articleComfortMode ? article.articleComfortMode : false}
              $onlyShowHighlights={onlyShowHighlights}
            >
              by
              { ' ' }
              {parsedArticle?.byline}
            </StyledArticleAuthor>
            )
            }
            <StyledReadingTime
              $useComfortMode={article.articleComfortMode ? article.articleComfortMode : false}
              $onlyShowHighlights={onlyShowHighlights}
            >
              Reading Time:
              { ' ' }
              {
                getArticleReadingTime(parsedArticle?.textContent)
              }
              { ' ' }
              min.
            </StyledReadingTime>
            {
            (parsedArticle?.excerpt) && (
              <StyledArticleExceprt
                $useComfortMode={article.articleComfortMode ? article.articleComfortMode : false}
                $onlyShowHighlights={onlyShowHighlights}
              >
                {parsedArticle?.excerpt}
              </StyledArticleExceprt>
            )
            }
            <StyledArticleContent
              $useComfortMode={article.articleComfortMode ? article.articleComfortMode : false}
              $onlyShowHighlights={onlyShowHighlights}
            >
              {parse(articleHtml)}
            </StyledArticleContent>
            {
            (!onlyShowHighlights) && (
            <StyledArticleEnd />
            )
            }

            {
              (onlyShowHighlights) && (
                <StyledHiglightsHelpText>
                  (click on any block in the article to add it to your highlights)
                </StyledHiglightsHelpText>
              )
            }
          </StyledReaderContentContainer>
        </ReaderContainer>
      )
    }
    </div>
  );
};

export default ArticleReader;
