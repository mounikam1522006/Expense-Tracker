package com.example.expense.service;

import com.example.expense.entity.Expense;
import com.example.expense.entity.User;
import com.example.expense.repository.ExpenseRepository;
import com.example.expense.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public Expense addExpense(String username, Expense expense) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    public List<Expense> getUserExpenses(String username) {
        return expenseRepository.findByUserUsername(username);
    }

    public List<Expense> getByCategory(String username, String category) {
        return expenseRepository.findByUserUsernameAndCategory(username, category);
    }

    public List<Expense> getByDateRange(String username, LocalDate start, LocalDate end) {
        return expenseRepository.findByUserUsernameAndDateBetween(username, start, end);
    }

    public Double getTotalExpense(String username) {
        return getUserExpenses(username).stream()
                .mapToDouble(Expense::getAmount).sum();
    }

    public Map<String, Double> getCategorySummary(String username) {
        return getUserExpenses(username).stream()
                .collect(Collectors.groupingBy(Expense::getCategory, Collectors.summingDouble(Expense::getAmount)));
    }

    public Map<String, Double> getMonthlyReport(String username) {
        return getUserExpenses(username).stream()
                .collect(Collectors.groupingBy(
                        e -> e.getDate().getMonth() + " " + e.getDate().getYear(),
                        Collectors.summingDouble(Expense::getAmount)
                ));
    }

    public Expense updateExpense(Long id, Expense expense) {
        Expense existing = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        existing.setAmount(expense.getAmount());
        existing.setCategory(expense.getCategory());
        existing.setDescription(expense.getDescription());
        existing.setDate(expense.getDate());
        return expenseRepository.save(existing);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
}
