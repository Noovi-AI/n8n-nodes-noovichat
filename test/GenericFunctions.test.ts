import { nooviChatApiRequest, nooviChatApiRequestAllItems, formatExecutionData } from '../nodes/NooviChat/GenericFunctions';

const mockRequest = jest.fn();
const mockGetCredentials = jest.fn().mockResolvedValue({
	baseUrl: 'https://chat.example.com/',
	apiAccessToken: 'test-token-123',
	accountId: 1,
});

function createContext(requestFn = mockRequest) {
	return {
		getCredentials: mockGetCredentials,
		helpers: {
			request: requestFn,
		},
		getNode: () => ({ name: 'NooviChat', typeVersion: 1 }),
	} as any;
}

describe('nooviChatApiRequest', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockRequest.mockResolvedValue({ id: 1, name: 'Test' });
	});

	it('should mount URL correctly with accountId', async () => {
		await nooviChatApiRequest.call(createContext(), 'GET', '/conversations');

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				uri: 'https://chat.example.com/api/v1/accounts/1/conversations',
				method: 'GET',
			}),
		);
	});

	it('should strip trailing slash from baseUrl', async () => {
		await nooviChatApiRequest.call(createContext(), 'GET', '/agents');

		const callArgs = mockRequest.mock.calls[0][0];
		expect(callArgs.uri).toBe('https://chat.example.com/api/v1/accounts/1/agents');
	});

	it('should set api_access_token header', async () => {
		await nooviChatApiRequest.call(createContext(), 'GET', '/conversations');

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					api_access_token: 'test-token-123',
				}),
			}),
		);
	});

	it('should set Content-Type application/json', async () => {
		await nooviChatApiRequest.call(createContext(), 'GET', '/conversations');

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
				}),
			}),
		);
	});

	it('should omit body when empty', async () => {
		await nooviChatApiRequest.call(createContext(), 'GET', '/conversations');

		const callArgs = mockRequest.mock.calls[0][0];
		expect(callArgs.body).toBeUndefined();
	});

	it('should include body when provided', async () => {
		const body = { content: 'Hello', message_type: 'outgoing' };
		await nooviChatApiRequest.call(createContext(), 'POST', '/conversations/1/messages', body);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				body,
				method: 'POST',
			}),
		);
	});

	it('should omit qs when empty', async () => {
		await nooviChatApiRequest.call(createContext(), 'GET', '/conversations');

		const callArgs = mockRequest.mock.calls[0][0];
		expect(callArgs.qs).toBeUndefined();
	});

	it('should include qs when provided', async () => {
		const qs = { per_page: 50, status: 'open' };
		await nooviChatApiRequest.call(createContext(), 'GET', '/conversations', {}, qs);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({ qs }),
		);
	});

	it('should throw error with message on API failure', async () => {
		const failRequest = jest.fn().mockRejectedValue(new Error('Unauthorized'));
		const ctx = createContext(failRequest);

		await expect(
			nooviChatApiRequest.call(ctx, 'GET', '/conversations'),
		).rejects.toThrow('NooviChat API Error: Unauthorized');
	});

	it('should handle PATCH requests', async () => {
		await nooviChatApiRequest.call(createContext(), 'PATCH', '/conversations/42', { status: 'resolved' });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'PATCH',
				uri: 'https://chat.example.com/api/v1/accounts/1/conversations/42',
				body: { status: 'resolved' },
			}),
		);
	});

	it('should handle DELETE requests', async () => {
		mockRequest.mockResolvedValue({});
		await nooviChatApiRequest.call(createContext(), 'DELETE', '/conversations/42');

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'DELETE',
				uri: 'https://chat.example.com/api/v1/accounts/1/conversations/42',
			}),
		);
	});
});

describe('nooviChatApiRequestAllItems', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return all items from single page', async () => {
		const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
		mockRequest.mockResolvedValue({ data: { payload: items } });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/conversations');

		expect(result).toEqual(items);
	});

	it('should paginate and collect all items', async () => {
		const page1 = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }));
		const page2 = [{ id: 16 }, { id: 17 }];

		mockRequest
			.mockResolvedValueOnce({ data: { payload: page1 } })
			.mockResolvedValueOnce({ data: { payload: page2 } });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/contacts');

		expect(result).toHaveLength(17);
		expect(result[0].id).toBe(1);
		expect(result[16].id).toBe(17);
	});

	it('should stop when items < 15', async () => {
		const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
		mockRequest.mockResolvedValue({ payload: items });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/agents');

		expect(result).toHaveLength(10);
		expect(mockRequest).toHaveBeenCalledTimes(1);
	});

	it('should handle response.data array format', async () => {
		const items = [{ id: 1 }, { id: 2 }];
		mockRequest.mockResolvedValue({ data: items });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/labels');

		expect(result).toEqual(items);
	});

	it('should handle direct array response', async () => {
		const items = [{ id: 1 }];
		mockRequest.mockResolvedValue(items);

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/agents');

		expect(result).toEqual(items);
	});

	it('should return empty array when response is empty', async () => {
		mockRequest.mockResolvedValue({ data: [] });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/conversations');

		expect(result).toEqual([]);
	});

	it('should pass page parameter incrementally', async () => {
		const page1 = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }));
		const page2: any[] = [];

		mockRequest
			.mockResolvedValueOnce({ data: page1 })
			.mockResolvedValueOnce({ data: page2 });

		await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/conversations');

		expect(mockRequest.mock.calls[0][0].qs).toEqual({ page: 1 });
		expect(mockRequest.mock.calls[1][0].qs).toEqual({ page: 2 });
	});
});

describe('formatExecutionData', () => {
	it('should wrap single object in array', () => {
		const input = { id: 1, name: 'Test' };
		const result = formatExecutionData(input);

		expect(result).toEqual([{ json: { id: 1, name: 'Test' } }]);
	});

	it('should map array items to INodeExecutionData format', () => {
		const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
		const result = formatExecutionData(input);

		expect(result).toHaveLength(3);
		expect(result[0]).toEqual({ json: { id: 1 } });
		expect(result[2]).toEqual({ json: { id: 3 } });
	});

	it('should handle empty array', () => {
		const result = formatExecutionData([]);
		expect(result).toEqual([]);
	});

	it('should handle null gracefully', () => {
		const result = formatExecutionData(null);
		expect(result).toEqual([{ json: null }]);
	});
});
