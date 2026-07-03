/*import*/
import styled from 'styled-components';
import React from 'react';

/*
모달 컴포넌트
default : 기본 모달 (알림, 친구 아이디어)
confirm : 확인 팝업 모달
*/

/*Props 타입 정의*/
interface ModalProps {
  type?: 'default' | 'confirm';
  size?: 'sm' | 'lg';
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

/*기본 모달 사이즈*/
const defaultSizeMap = {
  sm: `
    width: 360px;
    min-height: 240px;
    padding: 24px;
  `,
  lg: `
    width: 560px;
    min-height: 480px;
    padding: 24px;
  `,
};

/*스타일*/
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div<{ type: 'default' | 'confirm'; size: 'sm' | 'lg' }>`
  background-color: #ffffff;
  border: none;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  overflow: hidden;

  ${({ type, size }) =>
    type === 'default' &&
    `
      border-radius: 18px;
      ${defaultSizeMap[size]}
    `}

  ${({ type }) =>
    type === 'confirm' &&
    `
      width: 430px;
      height: 218px;
      border-radius: 18px;
      padding: 0;
    `}
`;

const ConfirmContent = styled.div`
  height: 141px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ConfirmMessage = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  text-align: center;
`;

const ConfirmButtonWrapper = styled.div`
  height: 77px;
  display: flex;
`;

const ConfirmButton = styled.button<{ variant: 'confirm' | 'cancel' }>`
  flex: 1;
  border: none;
  font-size: 20px;

  ${({ variant }) =>
    variant === 'confirm' &&
    `
      background-color: #e5e5e5;
      color: #000000;
    `}

  ${({ variant }) =>
    variant === 'cancel' &&
    `
      background-color: #444444;
      color: #ffffff;
    `}

  &:active {
    opacity: 0.6;
  }
`;

/*Modal 컴포넌트 정의*/
function Modal({
  type = 'default',
  size = 'sm',
  isOpen,
  onClose,
  children,
  message = '팝업창 확인 문구',
  confirmText = '네',
  cancelText = '아니오',
  onConfirm,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalBox type={type} size={size} onClick={(e) => e.stopPropagation()}>
        {type === 'default' && children}

        {type === 'confirm' && (
          <>
            <ConfirmContent>
              <ConfirmMessage>{message}</ConfirmMessage>
            </ConfirmContent>

            <ConfirmButtonWrapper>
              <ConfirmButton variant="confirm" onClick={onConfirm}>
                {confirmText}
              </ConfirmButton>
              <ConfirmButton variant="cancel" onClick={onClose}>
                {cancelText}
              </ConfirmButton>
            </ConfirmButtonWrapper>
          </>
        )}
      </ModalBox>
    </Overlay>
  );
}

export default Modal;
