import React, {
  useCallback,
} from 'react';
import styled from 'styled-components';
import 'react-spring-bottom-sheet/dist/style.css';

import usePortalStore from '../../store/store';
import { PortalMainStore } from '../../Types';
import CraftAPIHelper from '../../api/craftAPIHelper';

const StyledHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;

  > div {
    flex-grow: 1.1;
  }
`;

const StyledArticleTitle = styled.div`
  font-size: 13px;
  cursor: pointer;
  color: ${(props) => props.theme.accentColor};
`;

const StyledArticleTitleStatus = styled(StyledArticleTitle)`
  cursor: pointer;
`;

const ArticleHeader = () => {
  const article = usePortalStore((state: PortalMainStore) => state.article);
  const articleLoading = usePortalStore((state: PortalMainStore) => state.articleLoading);
  const parsedArticle = usePortalStore((state: PortalMainStore) => state.parsedArticle);

  const onOpenLink = useCallback(() => {
    if (article.activeUrl) {
      CraftAPIHelper.openUrl(article.activeUrl);
    }
  }, [article]);

  return (
    <StyledHeader>
      {
        (!articleLoading && !parsedArticle) && (
          <StyledArticleTitleStatus>
            No Article Found
          </StyledArticleTitleStatus>
        )
      }
      {
          (!articleLoading && parsedArticle) && (
          <StyledArticleTitle onClick={() => onOpenLink()}>
            {
              parsedArticle.title
            }
          </StyledArticleTitle>
          )
        }
      {
          (articleLoading) && (
          <StyledArticleTitleStatus>
            Loading Article...
          </StyledArticleTitleStatus>
          )
        }
    </StyledHeader>
  );
};

export default ArticleHeader;
