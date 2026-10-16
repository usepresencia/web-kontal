import { z } from 'zod';

const sidedSchema = z.object({ amount: z.string(), side: z.string() });

type TreeNode = {
    id: string;
    code: string;
    name: string;
    level: number;
    accountType: string;
    amount: string;
    children: TreeNode[];
};

/** Nó da árvore de contas com o valor do relatório. */
export const treeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
    z.object({
        id: z.string(),
        code: z.string(),
        name: z.string(),
        level: z.number(),
        accountType: z.string(),
        amount: z.string(),
        children: z.array(treeNodeSchema),
    }),
);

export type AccountTreeNode = TreeNode;

const dreLines = z.record(z.string(), z.string());

export const dreSchema = z.object({
    start: z.string(),
    end: z.string(),
    lines: dreLines,
    totals: z.object({ revenues: z.string(), expenses: z.string(), result: z.string() }),
    revenueTree: z.array(treeNodeSchema),
    expenseTree: z.array(treeNodeSchema),
    unclassified: z.array(
        z.object({ accountId: z.string(), code: z.string(), name: z.string(), amount: z.string() }),
    ),
    months: z
        .array(
            z.object({
                month: z.string(),
                revenues: z.string(),
                expenses: z.string(),
                result: z.string(),
            }),
        )
        .optional(),
});

export const trialBalanceSchema = z.object({
    start: z.string(),
    end: z.string(),
    lines: z.array(
        z.object({
            accountId: z.string(),
            code: z.string(),
            name: z.string(),
            level: z.number(),
            accountType: z.string(),
            openingBalance: sidedSchema,
            debits: z.string(),
            credits: z.string(),
            closingBalance: sidedSchema,
        }),
    ),
    totals: z.object({ debits: z.string(), credits: z.string() }),
});

const balanceGroup = z.object({ tree: z.array(treeNodeSchema), total: z.string() });

export const balanceSheetSchema = z.object({
    date: z.string(),
    assets: z.object({ current: balanceGroup, nonCurrent: balanceGroup, total: z.string() }),
    liabilities: z.object({ current: balanceGroup, nonCurrent: balanceGroup, total: z.string() }),
    equity: z.object({
        accounts: balanceGroup,
        accumulatedResult: z.string(),
        total: z.string(),
    }),
    liabilitiesAndEquity: z.string(),
});

const journalLine = z.object({
    accountCode: z.string(),
    accountName: z.string(),
    debit: z.string(),
    credit: z.string(),
    memo: z.string().nullable(),
});

export const journalEntrySchema = z.object({
    id: z.string(),
    number: z.number(),
    date: z.string(),
    description: z.string(),
    referenceType: z.string().nullable(),
    totalDebits: z.string(),
    totalCredits: z.string(),
    lines: z.array(journalLine),
});

export type JournalEntry = z.infer<typeof journalEntrySchema>;

export const dailyJournalSchema = z.object({
    start: z.string(),
    end: z.string(),
    items: z.array(
        z.object({
            date: z.string(),
            totalDebits: z.string(),
            totalCredits: z.string(),
            entries: z.array(journalEntrySchema),
        }),
    ),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
});

export const accountLedgerSchema = z.object({
    account: z.object({ id: z.string(), code: z.string(), name: z.string() }),
    start: z.string(),
    end: z.string(),
    openingBalance: sidedSchema,
    closingBalance: sidedSchema,
    items: z.array(
        z.object({
            date: z.string(),
            number: z.number(),
            description: z.string(),
            debit: z.string(),
            credit: z.string(),
            balance: sidedSchema,
        }),
    ),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
});
