package com.example.expense.controller;

import com.example.expense.entity.Expense;
import com.example.expense.service.ExpenseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin("*")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping("/{username}")
    public ResponseEntity<Expense> addExpense(@PathVariable String username, @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.addExpense(username, expense));
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<Expense>> getUserExpenses(@PathVariable String username) {
        return ResponseEntity.ok(expenseService.getUserExpenses(username));
    }

    @GetMapping("/{username}/category/{category}")
    public ResponseEntity<List<Expense>> getByCategory(@PathVariable String username, @PathVariable String category) {
        return ResponseEntity.ok(expenseService.getByCategory(username, category));
    }

    @GetMapping("/{username}/date-range")
    public ResponseEntity<List<Expense>> getByDateRange(
            @PathVariable String username,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(expenseService.getByDateRange(username, start, end));
    }

    @GetMapping("/{username}/total")
    public ResponseEntity<Double> getTotalExpense(@PathVariable String username) {
        return ResponseEntity.ok(expenseService.getTotalExpense(username));
    }

    @GetMapping("/{username}/category-summary")
    public ResponseEntity<Map<String, Double>> getCategorySummary(@PathVariable String username) {
        return ResponseEntity.ok(expenseService.getCategorySummary(username));
    }

    @GetMapping("/{username}/monthly-report")
    public ResponseEntity<Map<String, Double>> getMonthlyReport(@PathVariable String username) {
        return ResponseEntity.ok(expenseService.getMonthlyReport(username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok("Expense deleted successfully");
    }
}

