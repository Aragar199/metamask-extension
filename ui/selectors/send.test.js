import sinon from 'sinon';
import {
  getGasLimit,
  getGasPrice,
  getGasTotal,
  getPrimaryCurrency,
  getSendToken,
  getSendTokenContract,
  getSendAmount,
  sendAmountIsInError,
  getSendEditingTransactionId,
  getSendErrors,
  getSendFrom,
  getSendFromBalance,
  getSendFromObject,
  getSendMaxModeState,
  getSendTo,
  getTokenBalance,
  gasFeeIsInError,
  getGasLoadingError,
  getGasButtonGroupShown,
  getTitleKey,
  isSendFormInError,
} from './send';
import mockState from './send-selectors-test-data';
import {
  accountsWithSendEtherInfoSelector,
  getCurrentAccountWithSendEtherInfo,
} from '.';

describe('send selectors', () => {
  const tempGlobalEth = { ...global.eth };
  beforeEach(() => {
    global.eth = {
      contract: sinon.stub().returns({
        at: (address) => `mockAt:${address}`,
      }),
    };
  });

  afterEach(() => {
    global.eth = tempGlobalEth;
  });

  describe('accountsWithSendEtherInfoSelector()', () => {
    it('should return an array of account objects with name info from identities', () => {
      expect(accountsWithSendEtherInfoSelector(mockState)).toStrictEqual([
        {
          code: '0x',
          balance: '0x47c9d71831c76efe',
          nonce: '0x1b',
          address: '0xfdea65c8e26263f6d9a1b5de9555d2931a33b825',
          name: 'Send Account 1',
        },
        {
          code: '0x',
          balance: '0x37452b1315889f80',
          nonce: '0xa',
          address: '0xc5b8dbac4c1d3f152cdeb400e2313f309c410acb',
          name: 'Send Account 2',
        },
        {
          code: '0x',
          balance: '0x30c9d71831c76efe',
          nonce: '0x1c',
          address: '0x2f8d4a878cfa04a6e60d46362f5644deab66572d',
          name: 'Send Account 3',
        },
        {
          code: '0x',
          balance: '0x0',
          nonce: '0x0',
          address: '0xd85a4b6a394794842887b8284293d69163007bbb',
          name: 'Send Account 4',
        },
      ]);
    });
  });

  describe('getCurrentAccountWithSendEtherInfo()', () => {
    it('should return the currently selected account with identity info', () => {
      expect(getCurrentAccountWithSendEtherInfo(mockState)).toStrictEqual({
        code: '0x',
        balance: '0x0',
        nonce: '0x0',
        address: '0xd85a4b6a394794842887b8284293d69163007bbb',
        name: 'Send Account 4',
      });
    });
  });

  describe('getGasLimit()', () => {
    it('should return the send.gasLimit', () => {
      expect(getGasLimit(mockState)).toStrictEqual('0xFFFF');
    });
  });

  describe('getGasPrice()', () => {
    it('should return the send.gasPrice', () => {
      expect(getGasPrice(mockState)).toStrictEqual('0xaa');
    });
  });

  describe('getGasTotal()', () => {
    it('should return the send.gasTotal', () => {
      expect(getGasTotal(mockState)).toStrictEqual('a9ff56');
    });
  });

  describe('getPrimaryCurrency()', () => {
    it('should return the symbol of the send token', () => {
      expect(
        getPrimaryCurrency({
          send: { token: { symbol: 'DEF' } },
        }),
      ).toStrictEqual('DEF');
    });
  });

  describe('getSendToken()', () => {
    it('should return the current send token if set', () => {
      expect(
        getSendToken({
          send: {
            token: {
              address: '0x8d6b81208414189a58339873ab429b6c47ab92d3',
              decimals: 4,
              symbol: 'DEF',
            },
          },
        }),
      ).toStrictEqual({
        address: '0x8d6b81208414189a58339873ab429b6c47ab92d3',
        decimals: 4,
        symbol: 'DEF',
      });
    });
  });

  describe('getSendTokenContract()', () => {
    it('should return the contract at the send token address', () => {
      expect(
        getSendTokenContract({
          send: {
            token: {
              address: '0x8d6b81208414189a58339873ab429b6c47ab92d3',
              decimals: 4,
              symbol: 'DEF',
            },
          },
        }),
      ).toStrictEqual('mockAt:0x8d6b81208414189a58339873ab429b6c47ab92d3');
    });

    it('should return null if send token is not set', () => {
      expect(getSendTokenContract({ ...mockState, send: {} })).toBeNull();
    });
  });

  describe('getSendAmount()', () => {
    it('should return the send.amount', () => {
      expect(getSendAmount(mockState)).toStrictEqual('0x080');
    });
  });

  describe('getSendEditingTransactionId()', () => {
    it('should return the send.editingTransactionId', () => {
      expect(getSendEditingTransactionId(mockState)).toStrictEqual(97531);
    });
  });

  describe('getSendErrors()', () => {
    it('should return the send.errors', () => {
      expect(getSendErrors(mockState)).toStrictEqual({ someError: null });
    });
  });

  describe('getSendFrom()', () => {
    it('should return the send.from', () => {
      expect(getSendFrom(mockState)).toStrictEqual(
        '0xc5b8dbac4c1d3f152cdeb400e2313f309c410acb',
      );
    });
  });

  describe('getSendFromBalance()', () => {
    it('should get the send.from balance if it exists', () => {
      expect(getSendFromBalance(mockState)).toStrictEqual('0x37452b1315889f80');
    });

    it('should get the selected account balance if the send.from does not exist', () => {
      const editedMockState = {
        ...mockState,
        send: {
          ...mockState.send,
          from: null,
        },
      };
      expect(getSendFromBalance(editedMockState)).toStrictEqual('0x0');
    });
  });

  describe('getSendFromObject()', () => {
    it('should return send.from if it exists', () => {
      expect(getSendFromObject(mockState)).toStrictEqual({
        address: '0xc5b8dbac4c1d3f152cdeb400e2313f309c410acb',
        balance: '0x37452b1315889f80',
        code: '0x',
        nonce: '0xa',
      });
    });

    it('should return the current account if send.from does not exist', () => {
      const editedMockState = {
        ...mockState,
        send: {
          from: null,
        },
      };
      expect(getSendFromObject(editedMockState)).toStrictEqual({
        code: '0x',
        balance: '0x0',
        nonce: '0x0',
        address: '0xd85a4b6a394794842887b8284293d69163007bbb',
      });
    });
  });

  describe('getSendMaxModeState()', () => {
    it('should return send.maxModeOn', () => {
      expect(getSendMaxModeState(mockState)).toStrictEqual(false);
    });
  });

  describe('getSendTo()', () => {
    it('should return send.to', () => {
      expect(getSendTo(mockState)).toStrictEqual('0x987fedabc');
    });
  });

  describe('getTokenBalance()', () => {
    it('should', () => {
      expect(getTokenBalance(mockState)).toStrictEqual(3434);
    });
  });

  describe('send-amount-row selectors', () => {
    describe('sendAmountIsInError()', () => {
      it('should return true if send.errors.amount is truthy', () => {
        const state = {
          send: {
            errors: {
              amount: 'abc',
            },
          },
        };

        expect(sendAmountIsInError(state)).toStrictEqual(true);
      });

      it('should return false if send.errors.amount is falsy', () => {
        const state = {
          send: {
            errors: {
              amount: null,
            },
          },
        };

        expect(sendAmountIsInError(state)).toStrictEqual(false);
      });
    });
  });

  describe('send-gas-row selectors', () => {
    describe('getGasLoadingError()', () => {
      it('should return send.errors.gasLoading', () => {
        const state = {
          send: {
            errors: {
              gasLoading: 'abc',
            },
          },
        };

        expect(getGasLoadingError(state)).toStrictEqual('abc');
      });
    });

    describe('gasFeeIsInError()', () => {
      it('should return true if send.errors.gasFee is truthy', () => {
        const state = {
          send: {
            errors: {
              gasFee: 'def',
            },
          },
        };

        expect(gasFeeIsInError(state)).toStrictEqual(true);
      });

      it('should return false send.errors.gasFee is falsely', () => {
        const state = {
          send: {
            errors: {
              gasFee: null,
            },
          },
        };

        expect(gasFeeIsInError(state)).toStrictEqual(false);
      });
    });

    describe('getGasButtonGroupShown()', () => {
      it('should return send.gasButtonGroupShown', () => {
        const state = {
          send: {
            gasButtonGroupShown: 'foobar',
          },
        };

        expect(getGasButtonGroupShown(state)).toStrictEqual('foobar');
      });
    });
  });

  describe('send-header selectors', () => {
    const getMetamaskSendMockState = (send) => {
      return {
        send: { ...send },
      };
    };

    describe('getTitleKey()', () => {
      it('should return the correct key when "to" is empty', () => {
        expect(getTitleKey(getMetamaskSendMockState({}))).toStrictEqual(
          'addRecipient',
        );
      });

      it('should return the correct key when getSendEditingTransactionId is truthy', () => {
        expect(
          getTitleKey(
            getMetamaskSendMockState({
              to: true,
              editingTransactionId: true,
              token: {},
            }),
          ),
        ).toStrictEqual('edit');
      });

      it('should return the correct key when getSendEditingTransactionId is falsy and getSendToken is truthy', () => {
        expect(
          getTitleKey(
            getMetamaskSendMockState({
              to: true,
              editingTransactionId: false,
              token: {},
            }),
          ),
        ).toStrictEqual('sendTokens');
      });

      it('should return the correct key when getSendEditingTransactionId is falsy and getSendToken is falsy', () => {
        expect(
          getTitleKey(
            getMetamaskSendMockState({
              to: true,
              editingTransactionId: false,
              token: null,
            }),
          ),
        ).toStrictEqual('send');
      });
    });
  });

  describe('send-footer selectors', () => {
    const getSendMockState = (send) => {
      return {
        send: { ...send },
      };
    };

    describe('isSendFormInError()', () => {
      it('should return true if any of the values of the object returned by getSendErrors are truthy', () => {
        expect(
          isSendFormInError(
            getSendMockState({
              errors: [true],
            }),
          ),
        ).toStrictEqual(true);
      });

      it('should return false if all of the values of the object returned by getSendErrors are falsy', () => {
        expect(
          isSendFormInError(
            getSendMockState({
              errors: [],
            }),
          ),
        ).toStrictEqual(false);
        expect(
          isSendFormInError(
            getSendMockState({
              errors: [false],
            }),
          ),
        ).toStrictEqual(false);
      });
    });
  });
});
