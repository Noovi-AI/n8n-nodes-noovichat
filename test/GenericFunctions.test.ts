import { nooviChatApiRequest, nooviChatApiRequestAllItems, formatExecutionData, parseJsonValue } from '../nodes/NooviChat/GenericFunctions';

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
		getNodeParameter: jest.fn().mockReturnValue(1),
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

	it('should throw error with method and endpoint context on API failure', async () => {
		const failRequest = jest.fn().mockRejectedValue(new Error('Unauthorized'));
		const ctx = createContext(failRequest);

		await expect(
			nooviChatApiRequest.call(ctx, 'GET', '/conversations'),
		).rejects.toThrow('NooviChat API Error');
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

	it('should paginate and collect all items across multiple pages', async () => {
		// PAGE_SIZE is 25; first page full, second page partial → stop
		const page1 = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
		const page2 = [{ id: 26 }, { id: 27 }];

		mockRequest
			.mockResolvedValueOnce({ data: { payload: page1 } })
			.mockResolvedValueOnce({ data: { payload: page2 } });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/contacts');

		expect(result).toHaveLength(27);
		expect(result[0].id).toBe(1);
		expect(result[26].id).toBe(27);
	});

	it('should stop when items < PAGE_SIZE (25)', async () => {
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

	it('should pass page and per_page parameters incrementally', async () => {
		const page1 = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
		const page2: any[] = [];

		mockRequest
			.mockResolvedValueOnce({ data: page1 })
			.mockResolvedValueOnce({ data: page2 });

		await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/conversations');

		expect(mockRequest.mock.calls[0][0].qs).toEqual({ page: 1, per_page: 25 });
		expect(mockRequest.mock.calls[1][0].qs).toEqual({ page: 2, per_page: 25 });
	});

	// --- v0.8.1 regression coverage ---

	it('should use per_page=15 for /contacts (backend hardcoded RESULTS_PER_PAGE)', async () => {
		// Backend returns 15 → with old PAGE_SIZE=25 we falsely broke on first page
		const page1 = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }));
		const page2 = Array.from({ length: 15 }, (_, i) => ({ id: i + 16 }));
		const page3 = [{ id: 31 }];

		mockRequest
			.mockResolvedValueOnce({ payload: page1 })
			.mockResolvedValueOnce({ payload: page2 })
			.mockResolvedValueOnce({ payload: page3 });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/contacts');

		expect(result).toHaveLength(31);
		expect(mockRequest.mock.calls[0][0].qs).toEqual({ page: 1, per_page: 15 });
		expect(mockRequest.mock.calls[1][0].qs).toEqual({ page: 2, per_page: 15 });
		expect(mockRequest.mock.calls[2][0].qs).toEqual({ page: 3, per_page: 15 });
	});

	it('should use per_page=15 for /notifications and /audit_logs', async () => {
		mockRequest.mockResolvedValue({ payload: [{ id: 1 }] });

		await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/notifications');
		expect(mockRequest.mock.calls[0][0].qs).toEqual({ page: 1, per_page: 15 });

		mockRequest.mockClear();
		await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/audit_logs');
		expect(mockRequest.mock.calls[0][0].qs).toEqual({ page: 1, per_page: 15 });
	});

	it('should fall back to response.activities for pipeline/activities endpoint', async () => {
		// Backend: pipeline/activities_controller.rb returns { activities: [...], meta: {...} }
		const activities = [{ id: 1, title: 'Call' }, { id: 2, title: 'Email' }];
		mockRequest.mockResolvedValue({ activities, meta: { total: 2 } });

		const result = await nooviChatApiRequestAllItems.call(
			createContext(),
			'GET',
			'/pipeline/activities',
		);

		expect(result).toEqual(activities);
	});

	it('should extract { payload: { webhooks: [...] } } shape (webhooks endpoint)', async () => {
		// Backend: webhooks/index.json.jbuilder wraps payload as nested object.
		// Real bug reported 2026-05-24 — without fix, Get Many returned empty.
		const webhooks = [
			{ id: 1, url: 'https://hook.example.com/a', subscriptions: ['message_created'] },
			{ id: 2, url: 'https://hook.example.com/b', subscriptions: ['conversation_created'] },
		];
		mockRequest.mockResolvedValue({ payload: { webhooks } });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/webhooks');

		expect(result).toEqual(webhooks);
		expect(result).toHaveLength(2);
	});

	it('should handle { teams: [...], meta: {} } and similar root-level array shapes', async () => {
		// Tier 3 fallback: single array child at root level, excluding meta/links keys
		const teams = [{ id: 1, name: 'Sales' }, { id: 2, name: 'Support' }];
		mockRequest.mockResolvedValue({ teams, meta: { total: 2 } });

		const result = await nooviChatApiRequestAllItems.call(createContext(), 'GET', '/teams');

		expect(result).toEqual(teams);
	});

	it('should append _truncated sentinel when MAX_PAGES is reached', async () => {
		// Simulate a misbehaving backend that always returns full page
		const fullPage = Array.from({ length: 25 }, (_, i) => ({ id: i }));
		mockRequest.mockResolvedValue({ data: { payload: fullPage } });

		const result = await nooviChatApiRequestAllItems.call(
			createContext(),
			'GET',
			'/conversations',
		);

		// 400 pages × 25 = 10000 records + 1 sentinel
		expect(result.length).toBe(10001);
		const last = result[result.length - 1];
		expect(last._truncated).toBe(true);
		expect(last._truncated_reason).toContain('MAX_PAGES=400');
		expect(last._truncated_endpoint).toBe('/conversations');
	}, 30000);
});

describe('parseJsonValue', () => {
	it('should parse a JSON string to object', () => {
		expect(parseJsonValue('{"key":"value"}')).toEqual({ key: 'value' });
	});

	it('should parse a JSON string array', () => {
		expect(parseJsonValue('[1,2,3]')).toEqual([1, 2, 3]);
	});

	it('should return an object unchanged', () => {
		const obj = { a: 1 };
		expect(parseJsonValue(obj)).toBe(obj);
	});

	it('should return an array unchanged', () => {
		const arr = [1, 2, 3];
		expect(parseJsonValue(arr)).toBe(arr);
	});

	it('should return an invalid JSON string unchanged (no throw)', () => {
		expect(parseJsonValue('not-json')).toBe('not-json');
	});

	it('should return empty string unchanged', () => {
		expect(parseJsonValue('')).toBe('');
	});

	it('should return null unchanged', () => {
		expect(parseJsonValue(null)).toBeNull();
	});
});

describe('formatExecutionData', () => {
	it('should wrap single object in array', () => {
		const input = { id: 1, name: 'Test' };
		const result = formatExecutionData(input);

		expect(result).toEqual([{ json: { id: 1, name: 'Test' }, pairedItem: { item: 0 } }]);
	});

	it('should map array items to INodeExecutionData format', () => {
		const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
		const result = formatExecutionData(input);

		expect(result).toHaveLength(3);
		expect(result[0]).toEqual({ json: { id: 1 }, pairedItem: { item: 0 } });
		expect(result[2]).toEqual({ json: { id: 3 }, pairedItem: { item: 0 } });
	});

	it('should handle empty array', () => {
		const result = formatExecutionData([]);
		expect(result).toEqual([]);
	});

	it('should handle null gracefully', () => {
		const result = formatExecutionData(null);
		expect(result).toEqual([{ json: null, pairedItem: { item: 0 } }]);
	});
});
