/*import*/
import styled from 'styled-components';
import React, { useEffect } from 'react';

import { tokens } from '@/styles/tokens';

/*
모달 컴포넌트
default : 기본 모달 (알림, 친구 아이디어)
confirm : 확인 팝업 모달
*/

/*Props 타입 정의*/
interface CommonModalProps {
  size?: 'sm' | 'lg';
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface DefaultModalProps extends CommonModalProps {
  type?: 'default';
  children?: React.ReactNode;
}

interface ConfirmModalProps extends CommonModalProps {
  type: 'confirm';
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

type ModalProps = DefaultModalProps | ConfirmModalProps;

/*기본 모달 사이즈*/
const defaultSizeMap = {
  sm: `
    width: 360px;
    min-height: 240px;
    padding: ${tokens.spacing[24]};
  `,
  lg: `
    width: 560px;
    min-height: 480px;
    padding: ${tokens.spacing[24]};
  `,
};

/*스타일*/
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalWrapper = styled.div<{
  type: 'default' | 'confirm';
  size: 'sm' | 'lg';
}>`
  background-color: ${tokens.colors.background};
  border: none;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  overflow: hidden;

  ${({ type, size }) =>
    type === 'default' &&
    `
      border-radius: ${tokens.radius.lg};
      ${defaultSizeMap[size]}
    `}

  ${({ type }) =>
    type === 'confirm' &&
    `
      width: 320px;
      height: 160px;
      border-radius: ${tokens.radius.lg};
      padding: 0;
    `}
`;

const ConfirmContent = styled.div`
  height: 105px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ConfirmMessage = styled.p`
  margin: 0;
  font-size: ${tokens.fontSize.lg};
  font-weight: ${tokens.fontWeight.regular};
  line-height: 1.5;
  color: ${tokens.colors.text.primary};
  text-align: center;
`;

const ConfirmButtonWrapper = styled.div`
  height: 55px;
  display: flex;
`;

const ConfirmButton = styled.button<{
  variant: 'confirm' | 'cancel';
}>`
  flex: 1;
  border: none;
  font-size: ${tokens.fontSize.xl};

  ${({ variant }) =>
    variant === 'confirm' &&
    `
      background-color: #E5E5E5;
      color: ${tokens.colors.text.primary};
    `}

  ${({ variant }) =>
    variant === 'cancel' &&
    `
      background-color: #444444;
      color: ${tokens.colors.button.white};
    `}

  &:active {
    opacity: 0.6;
  }
`;

/*Modal 컴포넌트 정의*/
function Modal(props: ModalProps) {
  const { size = 'sm', isOpen, onClose, className } = props;

  /*Escape로 닫기 + 모달이 열려 있는 동안 배경 스크롤 막기*/
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalType = props.type === 'confirm' ? 'confirm' : 'default';

  return (
    <ModalOverlay onClick={onClose}>
      <ModalWrapper
        type={modalType}
        size={size}
        className={className}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {props.type === 'confirm' ? (
          <>
            <ConfirmContent>
              <ConfirmMessage>{props.message ?? '팝업창 확인 문구'}</ConfirmMessage>
            </ConfirmContent>

            <ConfirmButtonWrapper>
              <ConfirmButton type="button" variant="confirm" onClick={props.onConfirm}>
                {props.confirmText ?? '네'}
              </ConfirmButton>

              <ConfirmButton type="button" variant="cancel" onClick={onClose}>
                {props.cancelText ?? '아니오'}
              </ConfirmButton>
            </ConfirmButtonWrapper>
          </>
        ) : (
          props.children
        )}
      </ModalWrapper>
    </ModalOverlay>
  );
}

export default Modal;
